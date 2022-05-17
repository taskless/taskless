import * as tg from "generic-type-guard";

import type { TypeGuard } from "generic-type-guard";
import type { Job, JobHeaders } from "./job.js";

/** Typeguard for {@link JobHeaders} */
const isJobHeaders: TypeGuard<JobHeaders> = (o: unknown): o is JobHeaders => {
  return tg.isObject(o);
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
