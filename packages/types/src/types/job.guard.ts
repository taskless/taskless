import {
  IsInterface,
  hasProperties,
  isString,
  isOptional,
  isBoolean,
  isUnknown,
  isNumber,
  isNullable,
  isObject,
  type TypeGuard,
} from "generic-type-guard";

import { type Job, type JobHeaders } from "./job.js";

/** Typeguard for {@link JobHeaders} */
const isJobHeaders: TypeGuard<JobHeaders> = (o: unknown): o is JobHeaders => {
  return isObject(o);
};

/** Typeguard for {@link Job} with an unknown payload */
export const isJob: TypeGuard<Job<unknown>> = new IsInterface()
  .with(
    hasProperties({
      name: isString,
      endpoint: isString,
      headers: isOptional(isJobHeaders),
      enabled: isBoolean,
      payload: isUnknown,
      retries: isNumber,
      runAt: isString,
      runEvery: isNullable(isString),
    })
  )
  .get();
