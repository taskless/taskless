import type {
  UpdateJobMutationRPC,
  UpdateJobMutationRPCResponse,
  RPCOperation,
} from "@taskless/client/dev";
import { jobs, jobToJobFragment } from "worker/db";
import { start } from "worker/loop";
import { scheduleNext } from "worker/scheduler";

export const isUpdateJob = (v: RPCOperation): v is UpdateJobMutationRPC => {
  return v.method === "updateJob";
};

export const updateJob = async (
  variables: UpdateJobMutationRPC["variables"],
  context: any
): Promise<UpdateJobMutationRPCResponse["data"]> => {
  start();
  const id = context.v5(variables.name);
  const job = await jobs.get(id);
  if (!job) {
    throw new Error("Job not found");
  }

  const input = variables.job;

  if (typeof input.body === "string") {
    job.data.body = input.body;
  }

  if (typeof input.endpoint === "string") {
    job.data.endpoint = input.endpoint;
  }

  if (typeof input.enabled === "boolean") {
    job.data.enabled = input.enabled;
  }

  if (typeof input.headers !== "undefined") {
    job.data.headers = input.headers;
  }

  if (typeof input.method !== "undefined") {
    job.data.method = input.method;
  }

  if (typeof input.retries === "number") {
    job.data.retries = input.retries;
  }

  if (typeof input.runAt === "string") {
    job.data.runAt = input.runAt;
  }

  if (typeof input.runEvery === "string") {
    job.data.runEvery = input.runEvery;
  }

  scheduleNext(job);
  await jobs.put(job);

  return {
    updateJob: {
      ...jobToJobFragment(variables.name, job),
    },
  };
};
