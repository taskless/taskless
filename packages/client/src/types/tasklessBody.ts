import tg from "generic-type-guard";
import { isCipher } from "./ciphers.js";

import type { TypeGuard } from "generic-type-guard";
import type { Cipher, SupportedCiphers } from "./ciphers.js";

/** Describes the taskless Transport Metadata */
export type Transport = {
  /** The envelope version used */
  ev: 1;
  alg: SupportedCiphers;
} & Cipher;

/** Typeguard for {@link Transport} */
export const isTransport: TypeGuard<Transport> = new tg.IsInterface()
  .withProperties({
    ev: tg.isSingletonNumber(1),
  })
  .with(isCipher)
  .get();

/**
 * The taskless body definition (what is posted to & from the client)
 */
export type TasklessBody = {
  /** The Taskless Body Version */
  v: number;
  /** The encoder transport */
  transport: Transport;
  /** Possibly ciphered text */
  text: string;
  /** Signature of text field */
  signature: string;
};

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
