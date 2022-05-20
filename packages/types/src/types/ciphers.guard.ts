import {
  IsInterface,
  combine,
  isObject,
  hasProperties,
  isSingletonString,
  isNumber,
  isString,
  UnionOf,
  type TypeGuard,
} from "generic-type-guard";

import {
  type CipherEnvelope,
  type CipherAes256Gcm,
  type CipherNone,
} from "./ciphers.js";

/** Typeguard for {@link CipherAes256Gcm} */
const isCipherAes256Gcm: TypeGuard<CipherAes256Gcm> = new IsInterface()
  .with(
    combine(
      isObject,
      hasProperties({
        alg: isSingletonString("aes-256-gcm"),
        atl: isNumber,
        at: isString,
        iv: isString,
      })
    )
  )
  .get();

/** Typeguard for {@link CipherNone} */
const isCipherNone: TypeGuard<CipherNone> = new IsInterface()
  .with(
    combine(
      isObject,
      hasProperties({
        alg: isSingletonString("none"),
      })
    )
  )
  .get();

/** Typeguard for {@link Cipher} */
export const isCipherEnvelope: TypeGuard<CipherEnvelope> = new UnionOf(
  isCipherNone
)
  .with(isCipherAes256Gcm)
  .get();
