import type { Job as TasklessJob } from "@taskless/client";

/** The context for an RPC request */
export type Context = {
  v5: (str: string) => string;
};

/**
 * Defines the devserver version of a Taskless Job, where the payload (as far as we care) is a JSON-encoded string or null if empty
 */
type RPCJob = TasklessJob<string | null>;

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
  data: RPCJob;
  schedule: {
    check?: boolean;
    next?: number;
    attempt?: number;
  };
  logs?: LogEntry[];
};
