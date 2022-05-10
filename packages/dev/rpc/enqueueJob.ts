import {
  EnqueueJobMutationRPC,
  EnqueueJobMutationRPCResponse,
  RPCOperation,
} from "@taskless/client/dev";
import { DateTime } from "luxon";
import { Job as MJ, jobToJobFragment } from "mongo/db";
import { Context } from "types";
import { start } from "worker/loop";
import { gqlHeadersToObject } from "./common";

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

  const job = await MJ.findOneAndUpdate(
    { v5id: { $eq: id } },
    {
      $set: {
        body: variables.job.body ?? undefined,
        endpoint: variables.job.endpoint,
        headers: gqlHeadersToObject(variables.job.headers),
        name: variables.name,
        retries: variables.job.retries === 0 ? 0 : variables.job.retries ?? 5,
        runAt,
        runEvery: variables.job.runEvery ?? undefined,
        updatedAt: new Date(),
        v5id: id,
        schedule: {
          next: DateTime.fromISO(runAt).toJSDate(),
        },
      },
    },
    {
      returnDocument: "after",
      upsert: true,
    }
  ).exec();

  if (!job) {
    throw new Error("No job could be created or updated");
  }

  return {
    replaceJob: {
      ...jobToJobFragment(variables.name, job),
    },
  };
};
