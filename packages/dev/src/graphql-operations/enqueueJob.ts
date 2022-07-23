import { DateTime } from "luxon";
import { getJobsCollection, JobDoc } from "mongo/collections";
import { getQueue } from "mongo/mq";
import { Context } from "types";
import {
  EnqueueJobMutation,
  EnqueueJobMutationVariables,
} from "__generated__/schema";

export const enqueueJob = async (
  variables: EnqueueJobMutationVariables,
  context: Context
): Promise<EnqueueJobMutation> => {
  const id = context.v5(variables.name);
  let runAt = DateTime.now();

  if (typeof variables.job.runAt === "string" && variables.job.runAt !== "") {
    const dt = DateTime.fromISO(variables.job.runAt);
    if (dt.isValid) {
      runAt = dt;
    }
  }
  const retries = variables.job.retries ?? 5;
  const headers = !Array.isArray(variables.job.headers)
    ? {}
    : variables.job.headers.reduce<{ [key: string]: any }>((h, next) => {
        h[next.name] = next.value;
        return h;
      }, {});

  const queue = await getQueue();
  const col = await getJobsCollection();

  let doc: JobDoc | undefined;

  await queue.transaction(async (q) => {
    // job
    await q.enqueue({
      ref: id,
      payload: {
        applicationId: context.applicationId,
        organizationId: context.organizationId,
        jobId: id,
        name: variables.name,
        endpoint: variables.job.endpoint,
        headers: JSON.stringify(headers),
        body: variables.job.body ?? null,
        method: variables.job.method ?? "POST",
      },
      runAt: runAt.toJSDate(),
      runEvery: variables.job.runEvery ?? undefined,
    });

    // query / lookups
    const result = await col.findOneAndUpdate(
      {
        v5id: id,
      },
      {
        $set: {
          v5id: id,
          name: variables.name,
          endpoint: variables.job.endpoint,
          enabled: true,
          headers: JSON.stringify(headers),
          method: variables.job.method ?? "POST",
          body: variables.job.body ?? null,
          retries,
          runAt: runAt.toJSDate(),
          runEvery: variables.job.runEvery ?? undefined,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    if (!result.value) {
      throw new Error("Unable to update job in local DB");
    }

    doc = result.value;
  });

  if (typeof doc === "undefined") {
    throw new Error("No doc");
  }

  return {
    enqueueJob: {
      __typename: "Job",
      name: doc.name,
      endpoint: doc.endpoint,
      enabled: true,
      retries,
      runAt: runAt.toISO(),
      runEvery: doc.runEvery,
      headers: variables.job.headers,
      body: variables.job.body,
    },
  };
};
