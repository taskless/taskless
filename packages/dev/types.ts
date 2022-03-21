import { EnqueueJobMutationRPC } from "@taskless/client/dev";

export type Context = {
  v5: (str: string) => string;
};

type RPCJob = EnqueueJobMutationRPC["variables"]["job"] & {
  runAt: string;
  runEvery?: string;
};

/**
 * A Taskless Dev Job as a document object
 */
export type Job = {
  name: string;
  data: RPCJob;
  schedule: {
    last: string;
    next: string;
    attempt: number;
  };
  logs?: {
    ts: string;
    status: number;
    output: string;
  }[];
};
