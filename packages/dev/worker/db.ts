import { JobDataFragment } from "@taskless/client/dev";
import PouchDB from "pouchdb";
import upsert from "pouchdb-upsert";
import { Job } from "types";

PouchDB.plugin(upsert);
export const jobs = new PouchDB<Job>("jobs");

export const jobToJobFragment = (name: string, job: Job): JobDataFragment => {
  return {
    __typename: "Job",
    name: name,
    endpoint: job.data.endpoint,
    headers: job.data.headers,
    enabled: job.data.enabled === false ? false : true,
    body: job.data.body,
    retries: job.data.retries === 0 ? 0 : job.data.retries ?? 5,
    runAt: job.data.runAt,
    runEvery: job.data.runEvery,
  };
};

/*

type Nullable<T> = T | null;

type GQLHeader = {
  name: string;
  value: string;
};

export type Job = {
  id: string;
  name: string;
  enabled: boolean;
  endpoint: string;
  headers: Nullable<GQLHeader[]>;
  method: string;
  body: Nullable<string>;
  retries: number;
  runAt: string;
  runEvery: Nullable<string>;
};

export type Runner = {
  id: string;
  jobId: string;
  scheduled: string;
  ranAt: string;
  attempt: number;
};

export type Log = {
  id: string;
  jobId: string;
  statusCode: number;
  output: string;
};

const db = new loki("taskless.db");

export const jobs = db.addCollection<Job>("jobs", {
  unique: ["id"],
  indices: ["id"],
});

export const runners = db.addCollection<Runner>("runners", {
  unique: ["id"],
  indices: ["id", "jobId"],
});

export const logs = db.addCollection<Log>("logs", {
  unique: ["id"],
  indices: ["id", "jobId"],
});

export const pendingRunners = runners.addDynamicView("pendingRunners");
pendingRunners.applyWhere((obj: Runner) => {
  const now = DateTime.now();
  const next = DateTime.fromISO(obj.scheduled);
  const last = DateTime.fromISO(obj.ranAt);

  const shouldRun = last < next && next < now;
  return shouldRun;
});

*/
