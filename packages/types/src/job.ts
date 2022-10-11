import { type OutgoingHttpHeaders } from "node:http";
import { z } from "zod";
import { parse } from "tinyduration";

/** zod for {@link JobHeaders} */
export const jobHeaders = z.object({
  "x-taskless-application": z.string().optional(),
  "x-taskless-organization": z.string().optional(),
  "x-taskless-attempt": z.string().optional(),
});

/**
 * The set of headers to pass with a request, matching the set of valid HTTP request headers
 * extends the core {@see OutgoingHttpHeaders}
 */
export type JobHeaders = z.input<typeof jobHeaders> & OutgoingHttpHeaders;

const jobIdentifierPrimitive = z.union([z.string(), z.number()]);

/** zod for {@link JobIdentifier} */
export const jobIdentifier = z.union([
  jobIdentifierPrimitive,
  z.array(jobIdentifierPrimitive),
]);

/**
 * A Taskless Job identifier, either a string, number, or an array of
 * strings and numbers to namespace a job record. Job Identifiers must be unique to
 * the Taskless application.
 */
export type JobIdentifier = z.infer<typeof jobIdentifier>;

// datetime as either Date or string
export const dateOrIsoDate = z
  .union([z.date(), z.string()])
  .transform((arg: unknown) => {
    if (arg instanceof Date) {
      return arg;
    }
    if (typeof arg === "string") {
      const d = new Date(arg);
      if (!isNaN(d.getTime())) {
        return d;
      }
    }
    return undefined;
  });

// duration as string
export const duration = z.string().transform((arg: unknown, ctx) => {
  if (typeof arg === "string") {
    try {
      parse(arg);
      return arg;
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `"${arg}" is not a valid ISO-8601 Duration`,
      });
      return z.NEVER;
    }
  }
  return undefined;
});

/** zod for {@link JobOptions} */
export const jobOptions = z.object({
  /** A key/value object to recieve as headers when your job is called. Defaults to an empty object */
  headers: jobHeaders.passthrough().optional(),
  /** The number of retries to attempt before the job is failed. Defaults to 5 */
  retries: z.number().optional().default(5),
  /**
   * A JS date or ISO-8601 formatted timestamp in the future that, when set,
   * delays the execution of the job until the first opportunity after the specified
   * time. On job creation, a null or undefined value is treated as now().
   */
  runAt: dateOrIsoDate.nullable().optional(),
  /** An optional ISO-8601 Duration that enables repeated running of a job, or `null` to clear recurrence */
  runEvery: duration.nullable().optional(),
  /** An optional IANA time zone identifier used when calculating future jobs via `runEvery` */
  timezone: z.string().nullable().optional(),
});

/** A set of options on a per-job level */
export type JobOptions = z.input<typeof jobOptions> & {
  headers?: JobHeaders; // add standard headers as allowed
};

export const jobMetadata = z.object({
  /** The name of the queue that made the request */
  queue: z.string().nullable(),
  /** The project ID associated with the queue */
  projectId: z.string().nullable(),
  /** `true` if the payload's signature was verified */
  verified: z.boolean(),
});

/** Metadata regarding the currently running Job */
export type JobMetadata = z.infer<typeof jobMetadata>;

export const job = z.object({
  /** The name of the job, unique to the application */
  name: z.string(),
  /** The fully-qualified URL that will be called when this job executes */
  endpoint: z.string(),
  /** An optional set of key-value pairs to pass as headers when this job executes */
  headers: jobHeaders.optional(),
  /** Is the Job enabled? */
  enabled: z.boolean(),
  /** The number of retries for this Job */
  retries: z.number(),
  /** An ISO-8601 timestamp of when this job will be ran */
  runAt: dateOrIsoDate,
  /** An ISO-8601 duration for how often this job will repeat its run. A `null` value indicates no recurrence */
  runEvery: duration.nullable(),
  /** An optional IANA time zone identifier used when calculating future jobs via `runEvery` */
  timezone: z.string().nullable().optional(),
  /** The Job's payload to be delivered */
  payload: z.unknown(),
});

/** Describes a Taskless Job with a payload of type `T` */
export type Job<T> = z.infer<typeof job> & {
  /** The Job's payload to be delivered */
  payload: T;
};
