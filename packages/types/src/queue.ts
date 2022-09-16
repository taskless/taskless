import { type IncomingHttpHeaders, type OutgoingHttpHeaders } from "node:http";
import { z } from "zod";
import { type Promised } from "./common.js";
import {
  jobOptions,
  type Job,
  type JobIdentifier,
  type JobMetadata,
  type JobOptions,
} from "./job.js";
import { type TasklessBody } from "./tasklessBody.js";

const credentialsByAppId = z.object({
  /**
   * The Application ID from Taskless
   * If unset, will default to process.env.TASKLESS_APP_ID
   * @deprecated Prefer projectId, as individual application auth will be removed 2022Q4
   */
  appId: z.string(),
  /**
   * The secret token from taskless.io
   * If unset, will default to process.env.TASKLESS_APP_SECRET
   * A secret is required when running Taskless in production mode
   */
  secret: z
    .union([z.string(), z.null()])
    .optional()
    .default(() => process.env.TASKLESS_APP_SECRET ?? null),
  /**
   * A list of expired / rotated secrets to maintain compatibility
   * for unprocessed jobs. If unset, will default to a comma
   * separated string from  process.env.TASKLESS_PREVIOUS_APP_SECRETS
   * and will be automatically split into an array by the Taskless
   * client.
   */
  expiredSecrets: z
    .array(z.string())
    .optional()
    .default(() =>
      process.env.TASKLESS_PREVIOUS_APP_SECRETS
        ? process.env.TASKLESS_PREVIOUS_APP_SECRETS.split(",").map((s) =>
            s.trim()
          )
        : []
    ),
});

const credentialsByProjectId = z.object({
  /**
   * The Project ID from Taskless
   * If unset, will default to process.env.TASKLESS_ID
   */
  projectId: z.string(),
  /**
   * The secret token from taskless.io
   * If unset, will default to process.env.TASKLESS_SECRET
   * A secret is required when running Taskless in production mode
   */
  secret: z
    .union([z.string(), z.null()])
    .optional()
    .default(() => process.env.TASKLESS_SECRET ?? null),
  /**
   * A list of expired / rotated secrets to maintain compatibility
   * for unprocessed jobs. If unset, will default to a comma
   * separated string in process.env.TASKLESS_PREVIOUS_SECRETS
   * and will be automatically split into an array by the Taskless
   * client.
   */
  expiredSecrets: z
    .array(z.string())
    .optional()
    .default(() =>
      process.env.TASKLESS_PREVIOUS_SECRETS
        ? process.env.TASKLESS_PREVIOUS_SECRETS.split(",").map((s) => s.trim())
        : []
    ),
});

export const queueOptions = z.object({
  /** The base url, defaults to process.env.TASKLESS_BASE_URL */
  baseUrl: z
    .union([z.string(), z.null()])
    .optional()
    .default(() => process.env.TASKLESS_BASE_URL ?? null),
  /**
   * A separator for compound keys (passed as arrays). Defaults to `/`,
   * which is suitable for most situations but may also be overridden on
   * a per-queue basis.
   */
  separator: z.string().optional().default("/"),
  /** Your Application's credential pair */
  credentials: z
    .union([credentialsByAppId, credentialsByProjectId])
    .optional()
    .default(() => {
      const isModern = typeof process.env.TASKLESS_ID !== "undefined";
      if (isModern) {
        // console.log("parse modern");
        return credentialsByProjectId.parse({
          projectId:
            process.env.TASKLESS_ID ?? "00000000-0000-0000-0000-000000000000",
        });
      } else {
        // console.log("parse legacy");
        return credentialsByAppId.parse({
          appId:
            process.env.TASKLESS_APP_ID ??
            "00000000-0000-0000-0000-000000000000",
        });
      }
    }),

  /**
   * An optional encryption key for e2e encryption of job data.
   * Defaults to process.env.TASKLESS_ENCRYPTION_KEY. Must be
   * set in either the process.env or at Queue creation in
   * production to enable end-to-end encryption
   */
  encryptionKey: z
    .union([z.string(), z.null()])
    .optional()
    .default(() => process.env.TASKLESS_ENCRYPTION_KEY ?? null),
  /**
   * Previous encryption keys to assist in key rotation. If using
   * process.env.TASKLESS_PREVIOUS_ENCRYPTION_KEYS, a comma separated list
   * will be automatically split into an array for you
   */
  expiredEncryptionKeys: z
    .array(z.string())
    .optional()
    .default(() =>
      process.env.TASKLESS_PREVIOUS_ENCRYPTION_KEYS
        ? process.env.TASKLESS_PREVIOUS_ENCRYPTION_KEYS.split(",").map((s) =>
            s.trim()
          )
        : []
    ),
  /**
   * A default set of job options to apply to every job created in this queue. By
   * default, Taskless will always enable application/json in jobs it sends.
   */
  defaultJobOptions: jobOptions.optional().default(() => jobOptions.parse({})),
  /**
   * Allow unverified payloads.
   *
   * In development, it's common to not need your taskless secret for verifying
   * the signatures of payloads. In production, you should not enable unverified
   * signatures unless you are confirming the payload in some other manner. Otherwise,
   * your endpoints can be invoked by third parties without any confirmation of the
   * request's origin.
   */
  __dangerouslyAllowUnverifiedSignatures: z
    .object({
      allowed: z.boolean(),
    })
    .optional(),
});

/** A set of options for setting up a Taskless Queue */
export type QueueOptions = z.input<typeof queueOptions>;

/**
 * Describes the set of Queue Methods available on a Taskless Integration
 * @template T Types the payload expected in `enqueue` and `update`, as well as the payload key returned from `enqueue`, `update`, `delete`, and `get`
 */
export interface CreateQueueMethods<T> {
  /**
   * Adds an item to the queue. If an item of the same name exists, it will be replaced with this new data
   * @param name The Job's identifiable name. If an array is provided, all values will be concatenated with {@link QueueOptions.separator}, which is `-` by default
   * @param payload The Job's payload to be delivered
   * @param options Job options. These overwrite the default job options specified on the queue at creation time
   * @throws Error when the job could not be created in the Taskless system
   * @returns The `Job` object
   */
  enqueue: (
    name: JobIdentifier,
    payload: T,
    options?: JobOptions
  ) => Promise<Job<T>>;

  /**
   * Cancel any scheduled instances of a job by its identifier
   * @param name The Job's identifiable name. If an array is provided, all values will be concatenated with {@link QueueOptions.separator}, which is `-` by default
   * @throws Error if the job could not be cancelled
   * @returns The cancelled `Job` object, or `null` if no job was cancelled
   */
  cancel: (name: JobIdentifier) => Promise<Job<T> | null>;
}

/** The Job Handler signature, taking a `payload` and `meta` */
export interface JobHandler<T> {
  (payload: T, meta: JobMetadata): Promised<unknown>;
}

/** The result of the Job Handler callback */
export type JobHandlerResult = Promised<void | unknown>;

/** A set of callbacks used to integrate an external framework with the Taskless client */
export interface ReceiveCallbacks {
  getBody: () => Promised<TasklessBody>;
  getHeaders: () => Promised<IncomingHttpHeaders>;
  send: (json: unknown) => Promised<void>;
  sendError: (
    statusCode: number,
    headers: OutgoingHttpHeaders,
    json: unknown
  ) => Promised<void>;
}
