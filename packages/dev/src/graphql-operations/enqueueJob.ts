import { graphql } from "@taskless/types";
import { DateTime } from "luxon";
import { getQueue } from "db/mq";
import { Context } from "types";
import { getCollection, JobDoc } from "db/loki";

export const enqueueJob = async (
  variables: graphql.EnqueueJobMutationVariables,
  context: Context
): Promise<graphql.EnqueueJobMutation> => {
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
    : variables.job.headers.reduce<{ [key: string]: string }>((h, next) => {
        h[next.name] = next.value;
        return h;
      }, {});

  const queue = await getQueue();
  const col = getCollection<JobDoc>("jobs");

  let doc: JobDoc | undefined;

  await queue.transaction(async (q) => {
    // job
    await q.enqueue({
      ref: id,
      payload: {
        queueName: context.queueName,
        projectId: context.projectId,
        jobId: id,
        name: variables.name,
        endpoint: variables.job.endpoint,
        headers: JSON.stringify(headers),
        body: variables.job.body ?? null,
        method: variables.job.method ?? "POST",
      },
      runAt: runAt.toJSDate(),
      runEvery: variables.job.runEvery ?? undefined,
      timezone: variables.job.timezone ?? undefined,
    });

    const existing = col.findOne({ id });

    const next: JobDoc = {
      id,
      name: variables.name,
      endpoint: variables.job.endpoint,
      enabled: true,
      headers: JSON.stringify(headers),
      method: variables.job.method ?? "POST",
      body: variables.job.body ?? null,
      retries,
      runAt: runAt.toJSDate(),
      runEvery: variables.job.runEvery ?? undefined,
      timezone: variables.job.timezone ?? undefined,
    };

    if (existing) {
      col.chain().find({ id }).remove();
    }

    // insert (upsertish)
    col.insertOne(next);

    doc = next;
  });

  if (typeof doc === "undefined") {
    throw new Error("No doc");
  }

  return {
    enqueueJob: {
      id: doc.id,
      name: doc.name,
      endpoint: doc.endpoint,
      enabled: true,
      retries,
      runAt: runAt.toISO(),
      runEvery: doc.runEvery,
      headers: variables.job.headers,
      body: variables.job.body,
      timezone: variables.job.timezone,
    },
  };
};
