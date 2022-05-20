import { isCipherEnvelope } from "./types/ciphers.guard.js";
import { isJob } from "./types/job.guard.js";
import { isFinalizedQueueOptions } from "./types/queue.guard.js";
import { isTasklessBody, isTransport } from "./types/tasklessBody.guard.js";

export * from "./types/ciphers.js";
export * from "./types/job.js";
export * from "./types/queue.js";
export * from "./types/tasklessBody.js";

export const Guards = {
  Cipher: {
    isCipherEnvelope,
  },
  Job: {
    isJob,
  },
  Queue: {
    isFinalizedQueueOptions,
  },
  TasklessBody: {
    isTasklessBody,
    isTransport,
  },
} as const;
