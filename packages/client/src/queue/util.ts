import { type JobOptions } from "@taskless/types";
import { parsers } from "@taskless/types";

/** Merge sets of job options together, handling undefined sets of options */
export const resolveJobOptions = (
  ...opts: (Partial<JobOptions> | undefined)[]
): JobOptions => {
  let result: JobOptions = parsers.jobOptions.parse({});
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
