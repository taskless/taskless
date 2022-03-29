import type { IncomingHttpHeaders } from "http";
import { Job, JobMeta, JobOptions } from "./job.js";

/** A set of options for setting up a Taskless Queue */
export type QueueOptions = {
  /** The base url, defaults to process.env.TASKLESS_BASE_URL */
  baseUrl?: string;
  /** Your Application's credential pair of an Application ID and Application Secret. Defaults to process.env.TASKLESS_APP_ID and process.env.TASKLESS_APP_SECRET */
  credentials?: {
    appId: string;
    secret: string;
    expiredSecrets?: string[];
  };
  /** An optional encryption key for e2e encryption of job data. Defaults to process.env.TASKLESS_ENCRYPTION_KEY */
  encryptionKey?: string;
  /** Previous encryption keys to assist in key rotation. Defaults to a comma separated list in process.env.TASKLESS_PREVIOUS_ENCRYPTION_KEYS */
  expiredEncryptionKeys?: string[];
};

/**
 * Describes the set of Queue Methods available on a Taskless Integration
 * @template T Types the payload expected in `enqueue` and `update`, as well as the payload key returned from `enqueue`, `update`, `delete`, and `get`
 */
export type QueueMethods<T> = {
  /**
   * Adds an item to the queue. If an item of the same name exists, it will be replaced with this new data
   * @param name The Job's identifiable name
   * @param payload The Job's payload to be delivered
   * @param options Job options. These overwrite the default job options specified on the queue at creation time
   * @throws Error when the job could not be created in the Taskless system
   * @returns The `Job` object
   */
  enqueue: (name: string, payload: T, options?: JobOptions) => Promise<Job<T>>;
  /**
   * Update an existing item in the queue
   * @param name The Job's name
   * @param payload
   * @param options The Job Options. These are merged on top of the default Job Options specified on the queue at creation time
   * @throws Error when there is no existing item to update
   * @returns The `Job` object
   */
  update: (name: string, payload: T, options?: JobOptions) => Promise<Job<T>>;
  /**
   * Delete an item from the queue
   * @param name The Job's name
   * @throws Error if the job could not be deleted
   * @returns The deleted `Job` object, or `null` if no job was deleted
   */
  delete: (name: string) => Promise<Job<T> | null>;
  /**
   * Retrieve an item from the Taskless queue
   * @param name the Job's name
   * @returns The `Job` object or `null` if no job was deleted
   */
  get: (name: string) => Promise<Job<T> | null>;
};

/** The Job Handler signature, taking a `payload` and `meta` */
export type JobHandler<T> = (payload: T, meta: JobMeta) => Awaited<unknown>;

/** The result of the Job Handler callback */
export type JobHandlerResult = Awaited<void> | Awaited<unknown>;

/** An intgeration callback for getting the request body as a JSON object */
export type GetBodyCallback<T> = () => Awaited<T>;

/** An integration callback for getting the headers as a JSON object */
export type GetHeadersCallback = () =>
  | IncomingHttpHeaders
  | Promise<IncomingHttpHeaders>;

/** An integration callback for sending JSON back to Taskless.io */
export type SendJsonCallback = (json: unknown) => void | Promise<void>;
