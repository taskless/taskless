import { DateTime } from "luxon";
import { getQueue, TaskData } from "db/mq";
import { Context } from "types";
import { getCollection, JobDoc } from "db/loki";
import {
  type EnqueueJobsMutation,
  type EnqueueJobsMutationVariables,
} from "@taskless/client/graphql";

export const enqueueJobs = async (
  variables: EnqueueJobsMutationVariables,
  context: Context
): Promise<EnqueueJobsMutation> => {
  const now = DateTime.now();

  const sets = (
    Array.isArray(variables.jobs) ? variables.jobs : [variables.jobs]
  ).map((j) => {
    const id = context.v5(j.name);
    let runAt = now;
    if (typeof j.job.runAt === "string" && j.job.runAt !== "") {
      const dt = DateTime.fromISO(j.job.runAt);
      if (dt.isValid) {
        runAt = dt;
      }
    }
    const retries = j.job.retries ?? 5;
    const headers = !Array.isArray(j.job.headers)
      ? {}
      : j.job.headers.reduce<{ [key: string]: string }>((h, next) => {
          h[next.name] = next.value;
          return h;
        }, {});

    const payload: TaskData = {
      queueName: context.queueName,
      projectId: context.projectId,
      jobId: id,
      name: j.name,
      endpoint: j.job.endpoint,
      headers: JSON.stringify(headers),
      body: j.job.body ?? null,
      method: j.job.method ?? "POST",
    };

    const dmq = {
      ref: id,
      payload,
      retries,
      runAt: runAt.toJSDate(),
      runEvery: j.job.runEvery ?? undefined,
      timezone: j.job.timezone ?? undefined,
    };

    const tds: JobDoc = {
      id,
      name: j.name,
      endpoint: j.job.endpoint,
      enabled: true,
      headers: JSON.stringify(headers),
      method: j.job.method ?? "POST",
      body: j.job.body ?? null,
      retries,
      runAt: runAt.toISO() ?? "",
      runEvery: j.job.runEvery ?? undefined,
      timezone: j.job.timezone ?? undefined,
    };

    return { dmq, tds };
  });

  const results: JobDoc[] = [];
  const errors = [];
  const queue = await getQueue();
  const col = getCollection<JobDoc>("tds-jobs");
  for (const s of sets) {
    try {
      const id = s.tds.id;
      await queue.enqueue(s.dmq);
      const existing = col.findOne({ id });
      if (existing) {
        col.chain().find({ id }).remove();
      }
      col.insertOne(s.tds);
      results.push(s.tds);
    } catch (e) {
      errors.push(e);
    }
  }

  if (errors.length > 0) {
    console.error(errors);
  }

  return {
    enqueueJobs: results.map((r) => ({
      id: r.id,
      name: r.name,
      endpoint: r.endpoint,
      enabled: true,
      retries: r.retries,
      runAt: r.runAt,
      runEvery: r.runEvery,
      headers: r.headers,
      body: r.body,
      timezone: r.timezone,
    })),
  };
};
