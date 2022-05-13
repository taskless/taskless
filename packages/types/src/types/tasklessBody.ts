import type { Cipher, SupportedCiphers } from "./ciphers.js";

/** Describes the taskless Transport Metadata */
export type Transport = {
  /** The envelope version used */
  ev: 1;
  alg: SupportedCiphers;
} & Cipher;

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
