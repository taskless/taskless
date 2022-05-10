import type { NextApiRequest, NextApiResponse } from "next";
import { enqueueJob } from "rpc/enqueueJob";
import { v5 } from "uuid";
import {
  EnqueueJobMutation,
  EnqueueJobMutationRPC,
} from "@taskless/client/dev";

const initAppId = "00000000-0000-0000-0000-000000000000";

type ErrorResponse = {
  error: string;
};

export type UpsertJobResponse = EnqueueJobMutation;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EnqueueJobMutation | ErrorResponse | null>
) {
  let h;
  try {
    h = JSON.parse(req.body.headers);
  } catch {}

  const appId = h?.["x-taskless-app-id"] ?? initAppId;

  const context = {
    v5: (value: string) => v5(value, appId),
  };

  const variables: EnqueueJobMutationRPC["variables"] = req.body;

  if (!variables.name || !variables.job.endpoint) {
    return res.status(500).json({
      error: "Missing fields: name, job.endpoint",
    });
  }

  const result = await enqueueJob(variables, context);

  return res.status(200).json(result);
}
