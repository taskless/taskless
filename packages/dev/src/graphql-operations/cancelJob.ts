import { DateTime } from "luxon";
import { getJobsCollection, JobDoc } from "mongo/collections";
import { getQueue } from "mongo/mq";
import {
  CancelJobMutation,
  CancelJobMutationVariables,
} from "__generated__/schema";

export const cancelJob = async (
  variables: CancelJobMutationVariables,
  context: any
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

    if (!result.value) {
      throw new Error("TODO");
    }
    doc = result.value;
  });

  if (typeof doc === "undefined") {
    throw new Error("TODO");
  }

  return {
    cancelJob: {
      __typename: "Job",
      name: doc.name,
      endpoint: doc.endpoint,
      enabled: true,
      retries: doc.retries,
      runAt: DateTime.fromJSDate(doc.runAt).toISO(),
      runEvery: doc.runEvery,
      headers: doc.headers,
      body: doc.body,
    },
  };
};
