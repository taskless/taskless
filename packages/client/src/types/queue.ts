import { type IncomingHttpHeaders, type OutgoingHttpHeaders } from "node:http2";
import { z } from "zod";
import { type MaybePromised } from "./common.js";
import {
  type Job,
  type JobIdentifier,
  type JobOptions,
  jobOptions,
} from "./job.js";
import { type TasklessBody } from "./tasklessBody.js";

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
    .default(() => {
      /** Extract the netlify URL from env if set */
      const getNetlifyUrl = () => {
        const siteId = process.env.SITE_ID;
        const netlifyDev = process.env.NETLIFY_DEV;
        const deployUrl = process.env.DEPLOY_URL;
        if (siteId) {
          return "https://" + siteId + ".netlify.app";
        } else {
          if (netlifyDev) {
            return deployUrl;
          }
        }
        return undefined;
      };

      /** Extract the vercel URL from env is set */
      const getVercelUrl = () => {
        return process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : undefined;
      };

      const getTasklessUrl = () => {
        return process.env.TASKLESS_BASE_URL ?? undefined;
      };

      return getTasklessUrl() ?? getNetlifyUrl() ?? getVercelUrl() ?? null;
    }),
  /**
   * A separator for compound keys (passed as arrays). Defaults to `/`,
   * which is suitable for most situations but may also be overridden on
   * a per-queue basis.
   */
  separator: z.string().optional().default("/"),
  /** Your Project's credential pair */
  credentials: credentialsByProjectId.optional().default(() => {
    return credentialsByProjectId.parse({
      projectId:
        process.env.TASKLESS_ID ?? "00000000-0000-0000-0000-000000000000",
    });
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

export type BulkOperationResult<T> = [Job<T>[], Error[] | undefined];

export interface BaseQueue {
  /**
   * Recieve a message and execute the handler for it
   * errors are caught and converted to a 500 response, while
   * any success is returned as a 200
   * @param functions A set of accessory functions for accessing the request and dispatching a response
   */
  receive: (functions: ReceiveCallbacks) => Promise<void>;
}

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

  /** Defines Taskless' bulk operations */
  bulk: {
    /**
     * Cancel items in bulk on Taskless
     * In some situations, it may be useful to cancel jobs at a rate of > 1/request,
     * and for those situations Taskless provides a bulk api via client.bulk.*. Using
     * the bulk API comes with a few limitations, specifically:
     * - errors encountered during the bulk operation are logged and returned at the end
     * @param names An array of job identifiers to cancel
     * @returns A Promise containing the tuple [jobs, errors]
     */
    cancel: (names: JobIdentifier[]) => Promise<BulkOperationResult<T>>;
    /**
     * Enqueue items in bulk into Taskless
     * In some situations, it may be useful to enqueue jobs at a rate of > 1/request,
     * and for those situations Taskless provides a bulk api via client.bulk.*. Using
     * the bulk API comes with a few limitations, specifically:
     * - errors encountered during the bulk operation are logged and returned at the end
     * @param jobs An array of job objects, matching the signature for enqueue
     * @param jobs[].name The job's identifiable name
     * @param jobs[].payload The job's payload to deliver
     * @param jobs[].options Options for this job
     * @returns A Promise containing the tuple [jobs, errors]
     */
    enqueue: (
      jobs: { name: JobIdentifier; payload: T; options?: JobOptions }[]
    ) => Promise<BulkOperationResult<T>>;
  };
}

/**
 * Describes the methods available on a Taskless Queue instance
 * Taskless Queues are the objects that provide interface APIs to taskless.io via their
 * instance methods. When using an integration, this Queue object is created
 * automatically via the integration's `createQueue` method. When using the raw
 * taskless/client, a queue object can be created by calling `new Queue(...args)`
 */
export interface QueueMethods<T> extends BaseQueue, CreateQueueMethods<T> {}

export const jobMetadata = z.object({
  /** The name of the queue that made the request */
  name: z.string().nullable(),
  /** The project ID associated with the queue */
  projectId: z.string().nullable(),
  /** `true` if the payload's signature was verified */
  verified: z.boolean(),
  /** The queue object being used in executing this job */
  queue: z.unknown(),
});

/** Metadata regarding the currently running Job */
export type JobMetadata<Q> = z.infer<typeof jobMetadata> & {
  queue: Q;
};

/** The Job Handler signature, taking a `payload` and `meta` */
export interface JobHandler<T, Q extends QueueMethods<T> = QueueMethods<T>> {
  (payload: T, meta: JobMetadata<Q>): MaybePromised<unknown>;
}

/** The result of the Job Handler callback */
export type JobHandlerResult = MaybePromised<void | unknown>;

/** A set of callbacks used to integrate an external framework with the Taskless client */
export interface ReceiveCallbacks {
  getBody: () => MaybePromised<TasklessBody>;
  getHeaders: () => MaybePromised<IncomingHttpHeaders>;
  send: (json: unknown) => MaybePromised<void>;
  sendError: (
    statusCode: number,
    headers: OutgoingHttpHeaders,
    json: unknown
  ) => MaybePromised<void>;
}
