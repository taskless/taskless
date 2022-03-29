import { NextApiRequest, NextApiResponse } from "next";
import { CRON_JOB_NAME } from "./cron";
import SampleQueue from "./queues/sample";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const job = await SampleQueue.delete(CRON_JOB_NAME);

  res.status(200).json({
    message: "Successfully removed job",
    job,
  });
}
