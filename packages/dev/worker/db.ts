import { JobDataFragment } from "@taskless/client/dev";
import PouchDB from "pouchdb";
import upsert from "pouchdb-upsert";
import find from "pouchdb-find";
import memoryAdapter from "pouchdb-adapter-memory";
import { Job } from "types";
import { JobHeaders } from "@taskless/client";

PouchDB.plugin(upsert);
PouchDB.plugin(find);
PouchDB.plugin(memoryAdapter);
const jobs = new PouchDB<Job>("jobs", {
  adapter: "memory",
});

jobs.createIndex({
  index: {
    fields: ["schedule.check", "schedule.next"],
    name: "ready",
  },
});

export { jobs };

export const jobToJobFragment = (name: string, job: Job): JobDataFragment => {
  return {
    __typename: "Job",
    name: name,
    endpoint: job.data.endpoint,
    headers: job.data.headers,
    enabled: job.data.enabled === false ? false : true,
    body: job.data.payload as string | null | undefined,
    retries: job.data.retries === 0 ? 0 : job.data.retries ?? 5,
    runAt: job.data.runAt,
    runEvery: job.data.runEvery,
  };
};

type GQLHeaders =
  | {
      name: string;
      value: string;
    }[]
  | null;

export const gqlHeadersToObject = (gqlHeaders?: GQLHeaders): JobHeaders => {
  if (typeof gqlHeaders === "undefined" || gqlHeaders === null) {
    return {};
  }
  const all: JobHeaders = {};
  for (const h of gqlHeaders) {
    all[h.name] = h.value;
  }
  return all;
};
