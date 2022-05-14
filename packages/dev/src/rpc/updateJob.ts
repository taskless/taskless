import type { DEV } from "@taskless/client";
import { start } from "worker/loop";
import { Job, JobDoc, jobToJobFragment, Schedule } from "mongo/db";
import { gqlHeadersToObject } from "./common";
import { DateTime } from "luxon";

// local types
type RPCOperation = DEV["RPCOperation"];
type UpdateRPC = DEV["RPCMethods"]["Update"]["Request"];
type UpdateResponse = DEV["RPCMethods"]["Update"]["Response"];

export const isUpdateJob = (v: RPCOperation): v is UpdateRPC => {
  return v.method === "updateJob";
};

export const updateJob = async (
  variables: UpdateRPC["variables"],
  context: any
): Promise<UpdateResponse["data"]> => {
  start();
  const id = context.v5(variables.name);

  const next: Partial<JobDoc> = {};

  if (variables.job.body) {
    next.body = variables.job.body;
  }

  if (variables.job.endpoint) {
    next.endpoint = variables.job.endpoint;
  }

  if (typeof variables.job.enabled === "boolean") {
    next.enabled = variables.job.enabled;
  }

  if (variables.job.headers) {
    next.headers = gqlHeadersToObject(variables.job.headers) as Record<
      string,
      string
    >;
  }

  if (
    typeof variables.job.retries !== "undefined" &&
    variables.job.retries !== null
  ) {
    next.retries = variables.job.retries;
  }

  if (variables.job.runAt) {
    next.runAt = variables.job.runAt;
    next.schedule = new Schedule({
      next: DateTime.fromISO(variables.job.runAt).toJSDate(),
      attempt: 0,
    });
  }

  if (variables.job.runEvery) {
    next.runEvery = variables.job.runEvery;
  }

  next.updatedAt = new Date();

  const job = await Job.findOneAndUpdate(
    { v5id: { $eq: id } },
    {
      $set: next,
    },
    {
      returnDocument: "after",
      upsert: false,
    }
  ).exec();

  if (!job) {
    throw new Error("No job could be created or updated");
  }

  // TODO: schedule next

  return {
    updateJob: {
      ...jobToJobFragment(variables.name, job),
    },
  };
};
