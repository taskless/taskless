import { z } from "zod";
import { cipherEnvelope, supportedCiper } from "./ciphers.js";
import { json } from "./json.js";

export const transport = z
  .object({
    /** The envelope version used */
    ev: z.literal(1),
    /** One of the supported cipher types */
    alg: supportedCiper,
  })
  .and(cipherEnvelope);

/** Describes the taskless Transport Metadata */
export type Transport = z.infer<typeof transport>;

export const signedTextPayload = z.object({
  /** Possibly ciphered text */
  text: z.string(),
  /** Signature of text field */
  signature: z.string().optional(),
});

export const unsignedJsonPayload = z.object({
  /** Unciphered raw JSON */
  json: json,
});

export const tasklessBody = z
  .object({
    /** The Taskless Body Version */
    v: z.number(),
    /** The encoder transport */
    transport: transport.optional(),
  })
  .and(z.union([signedTextPayload, unsignedJsonPayload]));

export type TasklessBody = z.infer<typeof tasklessBody>;
