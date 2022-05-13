import * as tg from "generic-type-guard";
import { isCipher } from "./ciphers.guard.js";

import type { TypeGuard } from "generic-type-guard";
import type { TasklessBody, Transport } from "./tasklessBody.js";

/** Typeguard for {@link Transport} */
export const isTransport: TypeGuard<Transport> = new tg.IsInterface()
  .withProperties({
    ev: tg.isSingletonNumber(1),
  })
  .with(isCipher)
  .get();

/** Typeguard for {@link TasklessBody} */
export const isTasklessBody: TypeGuard<TasklessBody> = new tg.IsInterface()
  .with(
    tg.combine(
      tg.isObject,
      tg.hasProperties({
        v: tg.isNumber,
        transport: isTransport,
        text: tg.isString,
        signature: tg.isString,
      })
    )
  )
  .get();
