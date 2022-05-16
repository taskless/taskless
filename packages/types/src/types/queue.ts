import type { IncomingHttpHeaders, OutgoingHttpHeaders } from "node:http";
import { Promised } from "./common.js";
import type {
  DefaultJobOptions,
  Job,
  JobIdentifier,
  JobMetadata,
  JobOptions,
} from "./job.js";

/** A set of options for setting up a Taskless Queue */
export type QueueOptions = {
  /** The base url, defaults to process.env.TASKLESS_BASE_URL. Set to `false` to manage the full URL yourself */
  baseUrl?: string | boolean;

  /** A separator for compound keys (passed as arrays). Defaults to `-` */
  separator?: string;

  /** Your Application's credential pair */
  credentials?: {
    /**
     * The Application ID from Taskless
     * If unset, will default to process.env.TASKLESS_APP_ID
     */
    appId: string;
    /**
     * The secret for Application ID
     * If unset, will default to process.env.TASKLESS_APP_SECRET
     */
    secret: string;
    /**
     * A list of expired / rotated secrets to maintain compatibility
     * for unprocessed jobs. If unset, will default to a comma
     * separated string in process.env.TASKLESS_PREVIOUS_APP_SECRETS
     * and will be automatically split into an array by the Taskless
     * client.
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
  jobOptions?: DefaultJobOptions;
};

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
   * Update an existing item in the queue
   * @param name The Job's identifiable name. If an array is provided, all values will be concatenated with {@link QueueOptions.separator}, which is `-` by default
   * @param payload The Job's new payload of type T. If not provded, the existing payload will be used
   * @param options The Job Options. These are merged on top of the default Job Options specified on the queue at creation time
   * @throws Error when there is no existing item to update
   * @returns The `Job` object
   */
  update: (
    name: JobIdentifier,
    payload?: T,
    options?: JobOptions
  ) => Promise<Job<T>>;

  /**
   * Delete an item from the queue
   * @param name The Job's identifiable name. If an array is provided, all values will be concatenated with {@link QueueOptions.separator}, which is `-` by default
   * @throws Error if the job could not be deleted
   * @returns The deleted `Job` object, or `null` if no job was deleted
   */
  delete: (name: JobIdentifier) => Promise<Job<T> | null>;
  /**
   * Retrieve an item from the Taskless queue
   * @param name The Job's identifiable name. If an array is provided, all values will be concatenated with {@link QueueOptions.separator}, which is `-` by default
   * @returns The `Job` object or `null` if no job was deleted
   */
  get: (name: JobIdentifier) => Promise<Job<T> | null>;
}

/** The Job Handler signature, taking a `payload` and `meta` */
export type JobHandler<T> = (
  payload: T,
  meta: JobMetadata
) => Promised<unknown>;

/** The result of the Job Handler callback */
export type JobHandlerResult = Promised<void | unknown>;

/** An intgeration callback for getting the request body as a JSON object */
export type GetBodyCallback<T> = () => Promised<T>;

/** An integration callback for getting the headers as a JSON object */
export type GetHeadersCallback = () => Promised<IncomingHttpHeaders>;

/** An integration callback for sending JSON back to Taskless.io with a success response */
export type SendJsonCallback = (json: unknown) => Promised<void>;

/** An integration callback for sending JSON back to Taskless.io with a status code */
export type SendErrorJsonCallback = (
  statusCode: number,
  headers: OutgoingHttpHeaders,
  json: unknown
) => Promised<void>;
