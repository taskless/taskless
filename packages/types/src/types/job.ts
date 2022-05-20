import { type OutgoingHttpHeaders } from "node:http";

/**
 * The set of headers to pass with a request, matching the set of valid HTTP request headers
 * extends the core {@link OutgoingHttpHeaders}
 */
export interface JobHeaders extends OutgoingHttpHeaders {
  "x-taskless-application"?: string;
  "x-taskless-organization"?: string;
  "x-taskless-attempt"?: string;
}

/**
 * A Taskless Job identifier, either a string, number, or an array of
 * strings and numbers to namespace a job record. Job Identifiers must be unique to
 * the Taskless application.
 */
export type JobIdentifier = string | number | (string | number)[];

/** A set of options on a per-job level */
export type JobOptions = {
  /** Is the job enabled. Defaults to true. */
  enabled?: boolean;

  /** A key/value object to recieve as headers when your job is called. Defaults to an empty object */
  headers?: JobHeaders;

  /** The number of retries to attempt before the job is failed. Defaults to 5 */
  retries?: number;

  /**
   * An time to run the job, delaying it into the future in
   * ISO-8601 format. An explicit value of `null` will result in the job
   * running at the first available opportunity. If creating a job for the
   * first time, `undefined` will also be synonymous with `null`
   */
  runAt?: string | null;

  /** An optional ISO-8601 Duration that enables repeated running of a job, or null to clear recurrence */
  runEvery?: string | null;
};

/** Metadata regarding the currently running Job */
export type JobMetadata = {
  /** The application ID that made the request */
  applicationId: string | null;
  /** The organization ID that made the request */
  organizationId: string | null;
  /** A counter representing the number of attempts made */
  attempt: number;
};

/** Describes a Taskless Job with a payload of type `T` */
export type Job<T> = {
  /** The name of the job, unique to the application */
  name: string;
  /** The fully-qualified URL that will be called when this job executes */
  endpoint: string;
  /** An optional set of key-value pairs to pass as headers when this job executes */
  headers?: JobHeaders;
  /** Is the Job enabled? */
  enabled: boolean;
  /** The Job's payload to be delivered */
  payload: T;
  /** The number of retries for this Job */
  retries: number;
  /** An ISO-8601 timestamp of when this job will be ran */
  runAt: string;
  /** An ISO-8601 duration for how often this job will repeat its run. A `null` value indicates no recurrence */
  runEvery: string | null;
};
