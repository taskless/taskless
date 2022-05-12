import type { NextApiRequest, NextApiResponse } from "next";
import { EnqueueJobMutationRPC } from "@taskless/client/dev";
import { Job, JobHeaders, Queue } from "@taskless/client";
import { DateTime } from "luxon";

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

  const now = DateTime.now().toISO();
  let body: any = variables.job.body;
  if (variables.job.body) {
    try {
      body = JSON.parse(variables.job.body);
    } catch {
      /* noop */
    }
  }

  const j = await q.enqueue(variables.name, body, {
    enabled: variables.job.enabled ?? undefined,
    headers: (variables.job.headers ?? undefined) as JobHeaders | undefined,
    retries: variables.job.retries ?? undefined,
    runAt: variables.job.runAt === "" ? now : variables.job.runAt ?? now,
    runEvery: variables.job.runEvery,
  });

  return res.status(200).json({
    upsertJob: j,
  });
}
