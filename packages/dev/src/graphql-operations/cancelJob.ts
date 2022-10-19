import { graphql } from "@taskless/types";
import { getQueue } from "db/mq";
import { Context } from "types";
import { getCollection, JobDoc } from "db/loki";

export const cancelJob = async (
  variables: graphql.CancelJobMutationVariables,
  context: Context
): Promise<graphql.CancelJobMutation> => {
  const id = context.v5(variables.name);

  const queue = await getQueue();
  const col = getCollection<JobDoc>("tds-jobs");

  await queue.remove(variables.name);
  const doc = col
    .chain()
    .find({
      id,
    })
    .update((doc) => {
      doc.enabled = false;
      return doc;
    })
    .data()?.[0];

  if (typeof doc === "undefined") {
    // nothing to remove, null cancelJob
    return {
      cancelJob: null,
    };
  }

  return {
    cancelJob: {
      id: doc.id,
      name: doc.name,
      endpoint: doc.endpoint,
      enabled: true,
      retries: doc.retries,
      runAt: doc.runAt,
      runEvery: doc.runEvery,
      headers: doc.headers ? JSON.parse(doc.headers) : null,
      body: doc.body,
    },
  };
};
