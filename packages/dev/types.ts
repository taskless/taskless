import { Job as TasklessJob } from "@taskless/client";
import * as tg from "generic-type-guard";

export type Document<T> = PouchDB.Core.ExistingDocument<T>;

/** The context for an RPC request */
export type Context = {
  v5: (str: string) => string;
};

/**
 * A Taskless Dev Job as a document object
 * @see {isJob} ts-auto-guard:type-guard
 */
export type Job = {
  createdAt: number;
  updatedAt: number;
  data: TasklessJob<unknown>;
  schedule: {
    check?: boolean;
    next?: number;
    attempt?: number;
  };
};

/**
 * A log entry as a document object
 * Job (1) -> (M) JobLog
 */
export type JobLog = {
  createdAt: number;
  jobId: string;
  data: {
    status: string;
    statusCode: number;
    output: string;
  };
};

// https://github.com/pouchdb/pouchdb/blob/master/packages/node_modules/pouchdb-errors/src/index.js
export interface PouchError extends Error {
  status: number;
  name: string;
  message: string;
  error: boolean;
}

export const isPouchError = new tg.IsInterface()
  .withProperties({
    status: tg.isNumber,
    name: tg.isString,
    message: tg.isString,
    error: tg.isBoolean,
  })
  .get();
