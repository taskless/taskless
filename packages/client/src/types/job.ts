import type { TypeGuard } from "generic-type-guard";
import tg from "generic-type-guard";
import { OutgoingHttpHeaders } from "http";

export type JobHeaders = {
  [header: string]: string;
};

/** Typeguard for {@link JobHeaders} */
const isJobHeaders: TypeGuard<JobHeaders> = (o: unknown): o is JobHeaders => {
  return tg.isObject(o);
};

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
   * running at the first available opportunity
   */
  runAt: string | null;

  /** An optional ISO-8601 Duration that enables repeated running of a job*/
  runEvery?: string;
};

/** An optional set of job options */
export type DefaultJobOptions = Partial<JobOptions>;

/** Metadata regarding the currently running Job */
export type JobMeta = {
  /** The application ID that made the request */
  applicationId: string | null;
  /** The organization ID that made the request */
  organizationId: string | null;
  /** A counter representing the number of attempts made */
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
  /** An ISO-8601 timestamp of when this job will be ran. An explcit null will be treated as "immediately" */
  runAt: string;
  /** An ISO-8601 duration for how often this job will repeat its run */
  runEvery?: string;
};

/** Typeguard for {@link Job} with an unknown payload */
export const isJob: TypeGuard<Job<unknown>> = new tg.IsInterface()
  .with(
    tg.hasProperties({
      name: tg.isString,
      endpoint: tg.isString,
      headers: tg.isOptional(isJobHeaders),
      enabled: tg.isBoolean,
      payload: tg.isUnknown,
      retries: tg.isNumber,
      runAt: tg.isString,
      runEvery: tg.isOptional(tg.isString),
    })
  )
  .get();
