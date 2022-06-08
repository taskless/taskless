import { DateTime } from "luxon";
import { Job as MJ, jobToJobFragment } from "mongo/db";
import { Context } from "types";
import {
  EnqueueJobMutation,
  EnqueueJobMutationVariables,
} from "__generated__/schema";
import { gqlHeadersToObject } from "./common";

export const enqueueJob = async (
  variables: EnqueueJobMutationVariables,
  context: Context
): Promise<EnqueueJobMutation> => {
  const id = context.v5(variables.name);
  let runAt = DateTime.now().toISO();
  if (typeof variables.job.runAt === "string" && variables.job.runAt !== "") {
    const dt = DateTime.fromISO(variables.job.runAt);
    if (dt.isValid) {
      runAt = dt.toISO();
    }
  }

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
