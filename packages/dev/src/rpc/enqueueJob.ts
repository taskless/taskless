import { DEV } from "@taskless/client";
import { DateTime } from "luxon";
import { Job as MJ, jobToJobFragment } from "mongo/db";
import { Context } from "types";
import { gqlHeadersToObject } from "./common";

// local types
type RPCOperation = DEV["RPCOperation"];
type EnqueueRPC = DEV["RPCMethods"]["Enqueue"]["Request"];
type EnqueueResponse = DEV["RPCMethods"]["Enqueue"]["Response"];

export const isEnqueueJob = (v: RPCOperation): v is EnqueueRPC => {
  return v.method === "enqueueJob";
};

export const enqueueJob = async (
  variables: EnqueueRPC["variables"],
  context: Context
): Promise<EnqueueResponse["data"]> => {
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
