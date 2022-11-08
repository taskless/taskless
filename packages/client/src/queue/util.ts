import { jobOptions, type JobOptions } from "types/job.js";

/** Merge sets of job options together, handling undefined sets of options */
export const resolveJobOptions = (
  ...opts: (Partial<JobOptions> | undefined)[]
): JobOptions => {
  let result: JobOptions = jobOptions.parse({});
  for (const opt of opts) {
    if (typeof opt === "undefined" || opt === null) {
      continue;
    }
    result = {
      ...result,
      ...opt,
      headers: {
        ...(result.headers ?? {}),
        ...(opt.headers ?? {}),
      },
    };
  }
  return result;
};

/** Chunk an array into an array of arrays for batch operations */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const c = [];
  for (let i = 0, len = array.length; i < len; i += size)
    c.push(array.slice(i, i + size));
  return c;
};

/** Casts an object into an error from a few well-known variations */
export const asError = (e: unknown): Error => {
  try {
    return e instanceof Error
      ? e
      : typeof e === "string"
      ? new Error(e)
      : new Error(JSON.stringify(e));
  } catch {
    return new Error("An unknown error occured");
  }
};
