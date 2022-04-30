import { JobDataFragment } from "@taskless/client/dev";
import PouchDB from "pouchdb";
import upsert from "pouchdb-upsert";
import find from "pouchdb-find";
import memoryAdapter from "pouchdb-adapter-memory";
import { Job, JobLog } from "types";
import { JobHeaders } from "@taskless/client";

PouchDB.plugin(upsert);
PouchDB.plugin(find);
PouchDB.plugin(memoryAdapter);

type pouchDbInitializer<T> = (db: PouchDB.Database<T>) => Promise<void>;

/** A helper to create a pouchdb where we can ensure indexes are created */
const createPouch = <T>(
  db: PouchDB.Database<T>,
  init?: pouchDbInitializer<T>
) => {
  const ready = new Promise<void>((resolve) => {
    if (init) {
      init(db).then(resolve);
    } else {
      resolve();
    }
  });

  return {
    connect: async () => {
      await ready;
      return db;
    },
  };
};

const jobs = createPouch<Job>(
  new PouchDB<Job>("jobs", {
    adapter: "memory",
  }),
  async (db) => {
    await db.createIndex({
      index: {
        // jobs with a check enabled, sort by next
        fields: ["schedule.check", "schedule.next"],
      },
    });

    await db.createIndex({
      index: {
        // jobs, sorted by updatedAt
        fields: ["updatedAt"],
      },
    });
  }
);

const logs = createPouch<JobLog>(
  new PouchDB<JobLog>("logs", {
    adapter: "memory",
  }),
  async (db) => {
    await db.createIndex({
      index: {
        // logs sorted by creation
        fields: ["createdAt"],
      },
    });

    await db.createIndex({
      index: {
        // logs by job id sorted by creation
        fields: ["jobId", "createdAt"],
      },
    });
  }
);

export { jobs, logs };

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
