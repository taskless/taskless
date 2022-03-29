import {
  EnqueueJobMutationRPC,
  EnqueueJobMutationRPCResponse,
  RPCOperation,
} from "@taskless/client/dev";
import { DateTime } from "luxon";
import { Context, Job } from "types";
import { gqlHeadersToObject, jobs, jobToJobFragment } from "worker/db";
import { start } from "worker/loop";
import { scheduleNext } from "worker/scheduler";

export const isEnqueueJob = (v: RPCOperation): v is EnqueueJobMutationRPC => {
  return v.method === "enqueueJob";
};

export const enqueueJob = async (
  variables: EnqueueJobMutationRPC["variables"],
  context: Context
): Promise<EnqueueJobMutationRPCResponse["data"]> => {
  start();
  const id = context.v5(variables.name);
  const runAt = variables.job.runAt ?? DateTime.now().toISO();
  const db = await jobs.connect();

  await db.upsert(id, (doc) => {
    if (typeof doc.runs === "undefined") {
      doc.runs = 0;
    }
    if (!doc.schedule) {
      doc.schedule = {};
    }
    if (!doc.logs) {
      doc.logs = [];
    }
    doc.data = {
      name: variables.name,
      headers: gqlHeadersToObject(variables.job.headers),
      enabled: variables.job.enabled === false ? false : true,
      endpoint: variables.job.endpoint,
      payload: variables.job.body ?? null,
      retries: variables.job.retries === 0 ? 0 : variables.job.retries ?? 5,
      runAt,
      runEvery: variables.job.runEvery ?? null,
    };

    return doc as Job;
  });

  await scheduleNext(id);

  const job = await db.get(id);

  if (!job) {
    throw new Error("Could not create or replace Job");
  }

  return {
    replaceJob: {
      ...jobToJobFragment(variables.name, job),
    },
  };
};
