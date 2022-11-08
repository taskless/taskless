import { z } from "zod";

const AES256GCM = z.literal("aes-256-gcm");
const NONE = z.literal("none");

/** zod check for {@link SupportedCipher} */
export const supportedCiper = z.union([NONE, AES256GCM]);

/** Supported cipher values for end to end encryption */
export type SupportedCipher = z.infer<typeof supportedCiper>;

/** Required values for an AES-256 cipher */
const cipherAes256Gcm = z.object({
  alg: AES256GCM,
  atl: z.number(),
  at: z.string(),
  iv: z.string(),
});

/** Required values for a none cipher */
const cipherNone = z.object({
  alg: NONE,
});

/** zod check for {@link CipherEnvelope} */
export const cipherEnvelope = z.union([cipherNone, cipherAes256Gcm]);

/** All Supported Cipher combinations */
export type CipherEnvelope = z.infer<typeof cipherEnvelope>;
