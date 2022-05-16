import type { CipherEnvelope, SupportedCipher } from "./ciphers.js";

/** Describes the taskless Transport Metadata */
export type Transport = {
  /** The envelope version used */
  ev: 1;
  /** One of the supported ciphertypes */
  alg: SupportedCipher;
} & CipherEnvelope;

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
