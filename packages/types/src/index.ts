import {
  type CipherEnvelope,
  cipherEnvelope,
  type SupportedCipher,
} from "./ciphers.js";
import {
  job,
  jobOptions,
  type Job,
  type JobHeaders,
  type JobIdentifier,
  type JobOptions,
} from "./job.js";
import {
  queueOptions,
  type QueueOptions,
  type ReceiveCallbacks,
  type JobHandler,
  type CreateQueueMethods,
} from "./queue.js";
import {
  type TasklessBody,
  tasklessBody,
  transport,
  type Transport,
} from "./tasklessBody.js";
import { json, type Json } from "./json.js";

export type {
  // externally used
  JobHeaders,
  Job,
  JobHandler,
  JobIdentifier,
  JobOptions,
  QueueOptions,
  TasklessBody,
  // usually internal
  CreateQueueMethods,
  Json,
  ReceiveCallbacks,
  SupportedCipher,
  Transport,
};

export const parsers = {
  json,
  job,
  jobOptions,
  queueOptions,
  tasklessBody,
};

export * as graphql from "./__generated__/schema.js";

export const guards = {
  isCipherEnvelope: (v: unknown): v is CipherEnvelope => {
    return cipherEnvelope.safeParse(v).success;
  },
  isJob: (v: unknown): v is Job<unknown> => {
    return job.safeParse(v).success;
  },
  isTasklessBody: (v: unknown): v is TasklessBody => {
    return tasklessBody.safeParse(v).success;
  },
  isTransport: (v: unknown): v is Transport => {
    return transport.safeParse(v).success;
  },
};
