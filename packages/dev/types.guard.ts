/*
 * Generated type guards for "types.ts".
 * WARNING: Do not manually change this file.
 */
import { Job } from "./types";

export function isJob(obj: any, _argumentName?: string): obj is Job {
  return (
    ((obj !== null && typeof obj === "object") || typeof obj === "function") &&
    ((obj.data !== null && typeof obj.data === "object") ||
      typeof obj.data === "function") &&
    typeof obj.data.name === "string" &&
    typeof obj.data.endpoint === "string" &&
    (typeof obj.data.headers === "undefined" ||
      (obj.data.headers !== null && typeof obj.data.headers === "object") ||
      typeof obj.data.headers === "function") &&
    typeof obj.data.enabled === "boolean" &&
    (obj.data.payload === null || typeof obj.data.payload === "string") &&
    typeof obj.data.retries === "number" &&
    typeof obj.data.runAt === "string" &&
    (typeof obj.data.runEvery === "undefined" ||
      typeof obj.data.runEvery === "string") &&
    ((obj.schedule !== null && typeof obj.schedule === "object") ||
      typeof obj.schedule === "function") &&
    (typeof obj.schedule.check === "undefined" ||
      obj.schedule.check === false ||
      obj.schedule.check === true) &&
    (typeof obj.schedule.next === "undefined" ||
      typeof obj.schedule.next === "number") &&
    (typeof obj.schedule.attempt === "undefined" ||
      typeof obj.schedule.attempt === "number") &&
    (typeof obj.logs === "undefined" ||
      (Array.isArray(obj.logs) &&
        obj.logs.every(
          (e: any) =>
            ((e !== null && typeof e === "object") ||
              typeof e === "function") &&
            typeof e.ts === "string" &&
            typeof e.status === "number" &&
            typeof e.output === "string"
        )))
  );
}
