import { type CipherGCMTypes } from "node:crypto";

/** The aes-256-gcm cipher */
type AES256GCM = Extract<CipherGCMTypes, "aes-256-gcm">;

/** Supported cipher values for end to end encryption */
export type SupportedCipher = AES256GCM | "none";

/** Describes a cipher argument of type AES-256-GCM */
export interface CipherAes256Gcm {
  /** The Cipher used */
  alg: AES256GCM;
  /** The length of the Auth Tag */
  atl: number;
  /** The Auth Tag value */
  at: string;
  /** The Cipher IV value */
  iv: string;
}

/** Descibes a cipher argument of "none" */
export interface CipherNone {
  alg: "none";
}

/** All Supported Cipher combinations */
export type CipherEnvelope = CipherAes256Gcm | CipherNone;
