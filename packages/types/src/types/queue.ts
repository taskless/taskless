import { type IncomingHttpHeaders, type OutgoingHttpHeaders } from "node:http";

import { type Promised } from "./common.js";
import {
  type Job,
  type JobIdentifier,
  type JobMetadata,
  type JobOptions,
} from "./job.js";
import { type TasklessBody } from "./tasklessBody.js";

/** A set of options for setting up a Taskless Queue */
export interface QueueOptions {
  /** The base url, defaults to process.env.TASKLESS_BASE_URL */
  baseUrl?: string;

  /**
   * A separator for compound keys (passed as arrays). Defaults to `/`,
   * which is suitable for most situations but may also be overridden on
   * a per-queue basis.
   */
  separator?: string;

  /** Your Application's credential pair */
  credentials?: {
    /**
     * The Application ID from Taskless
     * If unset, will default to process.env.TASKLESS_APP_ID
     * @deprecated Prefer projectId, as individual application auth will be removed 2022Q4
     */
    appId?: string;
    /**
     * The Project ID from Taskless
     * If unset, will default to process.env.TASKLESS_ID
     */
    projectId?: string;
    /**
     * The secret token from taskless.io
     * If unset, will default to process.env.TASKLESS_SECRET and then
     * the legacy process.env.TASKLESS_APP_SECRET
     * A secret is required when running Taskless in production mode
     */
    secret?: string;
    /**
     * A list of expired / rotated secrets to maintain compatibility
     * for unprocessed jobs. If unset, will default to a comma
     * separated string in eiter process.env.TASKLESS_PREVIOUS_SECRETS
     * or process.env.TASKLESS_PREVIOUS_APP_SECRETS and will be
     * automatically split into an array by the Taskless client.
     */
    expiredSecrets?: string[];
  };

  /**
   * An optional encryption key for e2e encryption of job data.
   * Defaults to process.env.TASKLESS_ENCRYPTION_KEY. Must be
   * set in either the process.env or at Queue creation in
   * production to enable end-to-end encryption
   */
  encryptionKey?: string;

  /**
   * Previous encryption keys to assist in key rotation. If using
   * process.env.TASKLESS_PREVIOUS_ENCRYPTION_KEYS, a comma separated list
   * will be automatically split into an array for you
   */
  expiredEncryptionKeys?: string[];

  /** A default set of job options to apply to every job created in this queue */
  defaultJobOptions?: JobOptions;

  /**
   * Allow unverified payloads.
   *
   * In development, it's common to not need your taskless secret for verifying
   * the signatures of payloads. In production, you should not enable unverified
   * signatures unless you are confirming the payload in some other manner. Otherwise,
   * your endpoints can be invoked by third parties without any confirmation of the
   * request's origin.
   */
  __dangerouslyAllowUnverifiedSignatures?: {
    allowed: boolean;
  };
}

/** A finalized set of Queue options, where previously optional values must be realied */
export interface FinalizedQueueOptions extends QueueOptions {
  // redefines what finalized credentials look like
  credentials: {
    appId?: string;
    projectId?: string;
    secret: string;
    expiredSecrets?: string[];
  };
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
