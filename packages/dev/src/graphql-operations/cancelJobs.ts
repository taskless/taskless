import { getQueue } from "db/mq";
import { Context } from "types";
import { getCollection, JobDoc } from "db/loki";
import {
  type CancelJobsMutation,
  type CancelJobsMutationVariables,
} from "@taskless/client/graphql";

export const cancelJobs = async (
  variables: CancelJobsMutationVariables,
  context: Context
): Promise<CancelJobsMutation> => {
  const idents = (
    Array.isArray(variables.names) ? variables.names : [variables.names]
  ).map((v) => {
    return {
      name: v,
      id: context.v5(v),
    };
  });

  const queue = await getQueue();
  const col = getCollection<JobDoc>("tds-jobs");

  for (const id of idents) {
    await queue.remove(id.name);
  }

  const docs = col
    .chain()
    .find({
      id: {
        $in: idents.map((ident) => ident.id),
      },
    })
    .update((doc) => {
      doc.enabled = false;
      return doc;
    })
    .data();

  if (docs.length <= 0) {
    return {
      cancelJobs: null,
    };
  }

  return {
    cancelJobs: docs.map((doc) => ({
      id: doc.id,
      name: doc.name,
      endpoint: doc.endpoint,
      enabled: true,
      retries: doc.retries,
      runAt: doc.runAt,
      runEvery: doc.runEvery,
      headers: doc.headers ? JSON.parse(doc.headers) : null,
      body: doc.body,
    })),
  };
};
