import { Job as TasklessJob } from "@taskless/client";
import * as tg from "generic-type-guard";

export type Document<T> = PouchDB.Core.ExistingDocument<T>;

/** The context for an RPC request */
export type Context = {
  v5: (str: string) => string;
};

export type LogEntry = {
  ts: string;
  status: number;
  output: string;
};

/**
 * A Taskless Dev Job as a document object
 * @see {isJob} ts-auto-guard:type-guard
 */
export type Job = {
  data: TasklessJob<unknown>;
  schedule: {
    check?: boolean;
    next?: number;
    attempt?: number;
  };
  runs: number;
  lastLog?: string;
  logs?: LogEntry[];
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
