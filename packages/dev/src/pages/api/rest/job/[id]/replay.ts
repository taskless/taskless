import type { NextApiRequest, NextApiResponse } from "next";
import { getJobsCollection, JobDoc } from "mongo/collections";
import { getQueue } from "mongo/mq";

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

  const jc = await getJobsCollection();
  const queue = await getQueue();

  await queue.replay(id);

  const job = await jc.findOne(
    { v5id: id },
    {
      sort: {
        visible: -1,
      },
    }
  );

  res.status(200).json({
    job,
  });
}
