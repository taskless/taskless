import type { CipherGCMTypes } from "node:crypto";

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

/** Descibes a cipher argument of "none" */
export type CipherNone = {
  alg: "none";
};

/** All Supported Cipher combinations */
export type Cipher = CipherAes256Gcm | CipherNone;
