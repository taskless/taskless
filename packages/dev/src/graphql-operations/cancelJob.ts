import {
  type CancelJobMutation,
  type CancelJobMutationArguments,
} from "@taskless/types";
import { DateTime } from "luxon";
import { getJobsCollection, JobDoc } from "mongo/collections";
import { getQueue } from "mongo/mq";
import { Context } from "types";

export const cancelJob = async (
  variables: CancelJobMutationArguments,
  context: Context
): Promise<CancelJobMutation> => {
  const id = context.v5(variables.name);

  const queue = await getQueue();
  const col = await getJobsCollection();

  let doc: JobDoc | undefined;

  await queue.transaction(async (q) => {
    // remove
    await q.remove(variables.name);

    // drop enabled flag
    const result = await col.findOneAndUpdate(
      {
        v5id: id,
      },
      {
        $set: {
          enabled: false,
        },
      },
      {
        returnDocument: "after",
      }
    );

    doc = result.value ?? undefined;
  });

  if (typeof doc === "undefined") {
    // nothing to remove, null cancelJob
    return {
      cancelJob: null,
    };
  }

  return {
    cancelJob: {
      id: doc.v5id,
      name: doc.name,
      endpoint: doc.endpoint,
      enabled: true,
      retries: doc.retries,
      runAt: DateTime.fromJSDate(doc.runAt).toISO(),
      runEvery: doc.runEvery,
      headers: doc.headers ? JSON.parse(doc.headers) : null,
      body: doc.body,
    },
  };
};
