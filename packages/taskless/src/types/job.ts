import type { TypeGuard } from "generic-type-guard";
import tg from "generic-type-guard";

export type JobHeaders = {
  [header: string]: string;
};

/** Typeguard for {@link JobHeaders} */
const isJobHeaders: TypeGuard<JobHeaders> = (o: unknown): o is JobHeaders => {
  return tg.isObject(o);
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
