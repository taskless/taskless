import * as tg from "generic-type-guard";

import type { TypeGuard } from "generic-type-guard";
import type { Cipher, CipherAes256Gcm, CipherNone } from "./ciphers";

/** Typeguard for {@link CipherAes256Gcm} */
const isCipherAes256Gcm: TypeGuard<CipherAes256Gcm> = new tg.IsInterface()
  .with(
    tg.combine(
      tg.isObject,
      tg.hasProperties({
        alg: tg.isSingletonString("aes-256-gcm"),
        atl: tg.isNumber,
        at: tg.isString,
        iv: tg.isString,
      })
    )
  )
  .get();

/** Typeguard for {@link CipherNone} */
const isCipherNone: TypeGuard<CipherNone> = new tg.IsInterface()
  .with(
    tg.combine(
      tg.isObject,
      tg.hasProperties({
        alg: tg.isSingletonString("none"),
      })
    )
  )
  .get();

/** Typeguard for {@link Cipher} */
export const isCipher: TypeGuard<Cipher> = new tg.UnionOf(isCipherNone)
  .with(isCipherAes256Gcm)
  .get();
