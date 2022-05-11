import type { NextApiRequest, NextApiResponse } from "next";
import { EnqueueJobMutationRPC } from "@taskless/client/dev";
import { Queue, Job } from "@taskless/client";

const initAppId = "00000000-0000-0000-0000-000000000000";

type ErrorResponse = {
  error: string;
};

export type UpsertJobResponse = {
  upsertJob: Job<any>;
};

export type UpsertJobVariables = EnqueueJobMutationRPC["variables"] & {
  /** Describes unique data required to process this entry */
  __meta?: {
    queueName?: string;
    appId?: string;
    secret?: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpsertJobResponse | ErrorResponse>
) {
  const variables: UpsertJobVariables = req.body;

  const q = new Queue({
    name: variables.__meta?.queueName ?? "manual",
    route: variables.job.endpoint,
    queueOptions: {
      baseUrl: false,
      credentials: {
        appId: variables.__meta?.appId ?? initAppId,
        secret: variables.__meta?.secret ?? "",
      },
    },
  });

  const j = await q.enqueue("job name", variables.job.body, {
    enabled: variables.job.enabled,
    headers: variables.job.headers,
    retries: variables.job.retries,
    runAt: variables.job.runAt ?? null,
    runEvery: variables.job.runEvery,
  });

  return res.status(200).json({
    upsertJob: j,
  });
}
