import type { NextApiRequest, NextApiResponse } from "next";
import { getQueue } from "db/mq";
import { getCollection, JobDoc } from "db/loki";

type ErrorResponse = {
  error: string;
};

export type ReplayJobResponse = {
  job: JobDoc | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReplayJobResponse | ErrorResponse>
) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const jc = getCollection<JobDoc>("tds-jobs");
  const queue = await getQueue();

  if (!id) {
    return res.status(500).json({
      error: "No ID",
    });
  }

  await queue.replay(id);

  const job = jc
    .chain()
    .find({ id })
    .sort((a, b) => new Date(b.runAt).getTime() - new Date(a.runAt).getTime())
    .data()?.[0];

  res.status(200).json({
    job,
  });
}
