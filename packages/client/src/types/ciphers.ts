import tg from "generic-type-guard";

import type { CipherGCMTypes } from "node:crypto";
import type { TypeGuard } from "generic-type-guard";

/** Supported ciphers for end to end encryption */
export type SupportedCiphers = Extract<CipherGCMTypes, "aes-256-gcm"> | "none";

/** Describes a cipher argument of type AES-256-GCM */
export type CipherAes256Gcm = {
  /** The Cipher used */
  alg: Extract<CipherGCMTypes, "aes-256-gcm">;
  /** The length of the Auth Tag */
  atl: number;
  /** The Auth Tag */
  at: string;
  /** The Cipher IV value */
  iv: string;
};

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

/** Descibes a cipher argument of "none" */
export type CipherNone = {
  alg: "none";
};

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

/** All Supported Cipher combinations */
export type Cipher = CipherAes256Gcm | CipherNone;

/** Typeguard for {@link Cipher} */
export const isCipher: TypeGuard<Cipher> = new tg.UnionOf(isCipherNone)
  .with(isCipherAes256Gcm)
  .get();
