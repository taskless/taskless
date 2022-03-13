import type { IncomingHttpHeaders } from "node:http";

/** A set of options for setting up a Taskless Queue */
export type QueueOptions = {
  /** The base url, defaults to process.env.TASKLESS_BASE_URL */
  baseUrl?: string;
  /** Your Application's credential pair of an Application ID and Application Secret */
  credentials?: {
    appId?: string;
    secret?: string;
  };
  /** An optional encryption key for e2e encryption of job data */
  encryptionKey?: string;
  /** Previous encryption keys to assist in key rotation */
  expiredEncryptionKeys?: string[];
};

export type JobHeaders = {
  [header: string]: string;
};

/** A set of options on a per-job level */
export type JobOptions = {
  /** Is the job enabled */
  enabled?: boolean;
  /** A set of  key:value pairs to pass as job headers */
  headers?: JobHeaders;
  /** The number of retries to attempt before the job is failed */
  retries?: number;
  /** An optional time to run the job, delaying it into the future. ISO-8601 format */
  runAt?: string;
  /** An optional ISO-8601 duration that enables repeated running of a job*/
  runEvery?: string;
};

/** Metadata regarding the currently running Job */
export type JobMeta = {
  applicationId: string | null;
  organizationId: string | null;
  attempt: number;
};

/** Describes a Taskless.io Job with a payload of type `T` */
export type Job<T> = {
  /** The name of the job, unique to the application */
  name: string;
  /** The fully-qualified URL that will be called when this job executes */
  endpoint: string;
  /** An optional set of key-value pairs to pass as headers when this job executes */
  headers?: JobHeaders;
  /** Determines if the job is enabled or not */
  enabled: boolean;
  /** The Job's payload to be delivered */
  payload: T;
  /** The number of retries for this Job */
  retries: number;
  /** An ISO-8601 timestamp of when this job will be ran */
  runAt: string;
  /** An ISO-8601 duration for how often this job will repeat its run */
  runEvery?: string;
};

export type QueueMethods<T> = {
  /**
   * Adds an item to the queue. If an item of the same name exists, it will be replaced with this new data
   * @param name The Job's name. Should be unique to the system if you wish to retrieve it later. If `null` will result in a v4 uuid
   * @param payload The Job's payload to be delivered
   * @param options Job options. These overwrite the default job options specified on the queue at creation time
   * @throws Error when the job could not be created in the Taskless system
   * @returns The `Job` object
   */
  enqueue: (
    name: string | null,
    payload: T,
    options?: JobOptions
  ) => Promise<Job<T>>;
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
   * @returns The deleted `Job` object
   */
  delete: (name: string) => Promise<Job<T>>;
  /**
   * Retrieve an item from the Taskless queue
   * @param name the Job's name
   * @returns The `Job` object
   */
  get: (name: string) => Promise<Job<T>>;
};

/** The Job Handler signature, taking a `payload` and `meta` */
export type JobHandler<T> = (
  payload: T,
  meta: JobMeta
) => MaybePromise<JSONValue> | MaybePromise<void>;

type MaybePromise<T> = T | Promise<T>;

/** The result of the Job Handler callback */
export type JobHandlerResult = MaybePromise<void> | MaybePromise<JSONValue>;

/** An intgeration callback for getting the request body as a JSON object */
export type GetBodyCallback = () => MaybePromise<JSONValue>;

/** An integration callback for getting the headers as a JSON object */
export type GetHeadersCallback = () =>
  | IncomingHttpHeaders
  | Promise<IncomingHttpHeaders>;

/** An integration callback for sending JSON back to Taskless.io */
export type SendJsonCallback = (json: JSONValue) => void | Promise<void>;

/** The taskless body definition (what is posted to & from the client) */
export type TasklessBody = {
  v: number;
  taskless: string;
};

/** Supported taskless schema versions. Must be accounted for in typeguard */
const SUPPORTED_BODY_VERSIONS = [1];

/** Typeguard for TasklessBody */
export function isTasklessBody(body: unknown): body is TasklessBody {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof (body as TasklessBody).taskless !== "undefined" &&
    typeof (body as TasklessBody).v !== "undefined" &&
    SUPPORTED_BODY_VERSIONS.includes((body as TasklessBody).v)
  );
}

/** A recursive description of a valid JSON value */
type JSONValue =
  | null
  | string
  | number
  | boolean
  | { [key: string]: JSONValue }
  | Array<JSONValue>;
