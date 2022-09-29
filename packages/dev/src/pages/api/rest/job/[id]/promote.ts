import { getCollection, JobDoc } from "db/loki";
import { getQueue } from "db/mq";
import type { NextApiRequest, NextApiResponse } from "next";

type ErrorResponse = {
  error: string;
};

export type PromoteJobResponse = {
  job: JobDoc | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PromoteJobResponse | ErrorResponse>
) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const jc = getCollection<JobDoc>("jobs");
  const queue = await getQueue();

  if (!id) {
    return res.status(500).json({
      error: "No ID",
    });
  }

  await queue.promote(id);
  const job = jc.findOne({ id });

  res.status(200).json({
    job,
  });
}
