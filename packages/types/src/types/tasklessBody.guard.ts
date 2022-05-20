import {
  IsInterface,
  isSingletonNumber,
  combine,
  isObject,
  hasProperties,
  isNumber,
  isString,
  type TypeGuard,
} from "generic-type-guard";

import { isCipherEnvelope } from "./ciphers.guard.js";
import { type TasklessBody, type Transport } from "./tasklessBody.js";

/** Typeguard for {@link Transport} */
export const isTransport: TypeGuard<Transport> = new IsInterface()
  .withProperties({
    ev: isSingletonNumber(1),
  })
  .with(isCipherEnvelope)
  .get();

/** Typeguard for {@link TasklessBody} */
export const isTasklessBody: TypeGuard<TasklessBody> = new IsInterface()
  .with(
    combine(
      isObject,
      hasProperties({
        v: isNumber,
        transport: isTransport,
        text: isString,
        signature: isString,
      })
    )
  )
  .get();
