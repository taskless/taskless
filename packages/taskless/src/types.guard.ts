/*
 * Generated type guards for "types.ts".
 * WARNING: Do not manually change this file.
 */
import { TasklessBody } from "./types";

export function isTasklessBody(
  obj: any,
  _argumentName?: string
): obj is TasklessBody {
  if (process.env.NODE_ENV === "production") return true;
  return (
    ((obj !== null && typeof obj === "object") || typeof obj === "function") &&
    typeof obj.v === "number" &&
    ((((obj.transport !== null && typeof obj.transport === "object") ||
      typeof obj.transport === "function") &&
      obj.transport.ev === 1 &&
      (obj.transport.alg === "aes-256-gcm" || obj.transport.alg === "none") &&
      ((obj.transport !== null && typeof obj.transport === "object") ||
        typeof obj.transport === "function") &&
      obj.transport.alg === "aes-256-gcm" &&
      typeof obj.transport.atl === "number" &&
      typeof obj.transport.at === "string" &&
      typeof obj.transport.iv === "string") ||
      (((obj.transport !== null && typeof obj.transport === "object") ||
        typeof obj.transport === "function") &&
        obj.transport.ev === 1 &&
        (obj.transport.alg === "aes-256-gcm" || obj.transport.alg === "none") &&
        ((obj.transport !== null && typeof obj.transport === "object") ||
          typeof obj.transport === "function") &&
        obj.transport.alg === "none")) &&
    typeof obj.text === "string" &&
    typeof obj.signature === "string"
  );
}
