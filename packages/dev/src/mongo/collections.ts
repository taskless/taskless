import { getClient } from "./client";

export const JOB_DB = "taskless-dev";
export const JOB_COL = "jobs";
export const RUN_COL = "runs";

export interface JobDoc {
  v5id: string;
  name: string;
  enabled: boolean;
  endpoint: string;
  headers: string;
  method: string;
  body: string | null;
  retries: number;
  runAt: Date;
  runEvery?: string;
  summary?: {
    nextRun?: Date;
    lastRun?: Date;
    lastStatus?: boolean;
  };
}

export interface RunDoc {
  ts: Date;
  metadata: {
    v5id: string;
    name: string;
  };
  success: boolean;
  statusCode: number;
  payload: string;
  body?: string;
}

export const getJobsCollection = async () => {
  const c = await getClient();
  const col = c.db(JOB_DB).collection<JobDoc>(JOB_COL);

  // indexes
  await col.createIndex([["v5id", 1]]);
  await col.createIndex([["lastRun", 1]]);

  return col;
};

export const getRunsCollection = async () => {
  const c = await getClient();
  const col = c.db(JOB_DB).collection<RunDoc>(RUN_COL);

  // indexes
  await col.createIndex([
    ["metadata.v5id", 1],
    ["ts", -1],
  ]);
  await col.createIndex([["ts", -1]]);

  return col;
};
