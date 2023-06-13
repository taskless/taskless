import { DateTime } from "luxon";
import { getQueue } from "db/mq";
import { Context } from "types";
import { getCollection, JobDoc } from "db/loki";
import {
  type EnqueueJobMutation,
  type EnqueueJobMutationVariables,
} from "@taskless/client/graphql";

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
    : variables.job.headers.reduce<{ [key: string]: string }>((h, next) => {
        h[next.name] = next.value;
        return h;
      }, {});

  const queue = await getQueue();
  const col = getCollection<JobDoc>("tds-jobs");

  let doc: JobDoc | undefined;

  try {
    await queue.enqueue({
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
      retries: variables.job.retries ?? undefined,
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
      runAt: runAt.toISO() ?? "",
      runEvery: variables.job.runEvery ?? undefined,
      timezone: variables.job.timezone ?? undefined,
    };

    if (existing) {
      col.chain().find({ id }).remove();
    }

    // insert (upsertish)
    col.insertOne(next);

    doc = next;
  } catch (e) {
    doc = undefined;
  }

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
