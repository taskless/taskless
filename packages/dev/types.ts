import { Job as TasklessJob } from "@taskless/client";

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
