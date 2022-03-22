import type {
  UpdateJobMutationRPC,
  UpdateJobMutationRPCResponse,
  RPCOperation,
} from "@taskless/client/dev";
import { gqlHeadersToObject, jobs, jobToJobFragment } from "worker/db";
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
  const next = await jobs.get(id);
  if (!next) {
    throw new Error("Job not found");
  }

  const input = variables.job;

  if (typeof input.body === "string" || input.body === null) {
    next.data.payload = input.body;
  }

  if (typeof input.endpoint === "string") {
    next.data.endpoint = input.endpoint;
  }

  if (typeof input.enabled === "boolean") {
    next.data.enabled = input.enabled;
  }

  if (typeof input.headers !== "undefined") {
    next.data.headers = gqlHeadersToObject(input.headers);
  }

  if (typeof input.retries === "number") {
    next.data.retries = input.retries;
  }

  if (typeof input.runAt === "string") {
    next.data.runAt = input.runAt;
  }

  if (typeof input.runEvery === "string") {
    next.data.runEvery = input.runEvery;
  }

  // manually unschedule
  next.schedule = {};

  await jobs.put(next);
  await scheduleNext(id);
  const job = await jobs.get(id);

  return {
    updateJob: {
      ...jobToJobFragment(variables.name, job),
    },
  };
};
