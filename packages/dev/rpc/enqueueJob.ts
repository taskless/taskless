import {
  EnqueueJobMutationRPC,
  EnqueueJobMutationRPCResponse,
  JobMethodEnum,
  RPCOperation,
} from "@taskless/client/dev";
import { DateTime } from "luxon";
import { Context, Job } from "types";
import { jobs, jobToJobFragment } from "worker/db";
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

  await jobs.upsert(id, (doc) => {
    doc.name = variables.name;
    doc.data = {
      headers: variables.job.headers ?? [],
      enabled: variables.job.enabled === false ? false : true,
      endpoint: variables.job.endpoint,
      method: variables.job.method ?? JobMethodEnum.Post,
      body: variables.job.body ?? null,
      retries: variables.job.retries === 0 ? 0 : variables.job.retries ?? 5,
      runAt: variables.job.runAt ?? DateTime.now().toISO(),
      runEvery: variables.job.runEvery ?? null,
    };

    return doc as Job;
  });

  const job = await jobs.get(id);

  if (!job) {
    throw new Error("Could not create or replace Job");
  }

  scheduleNext(job);

  return {
    replaceJob: {
      ...jobToJobFragment(variables.name, job),
    },
  };
};
