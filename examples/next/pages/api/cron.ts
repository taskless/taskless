import { NextApiRequest, NextApiResponse } from "next";
import SampleQueue from "./queues/sample";

export const CRON_JOB_NAME = "cronned";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const job = await SampleQueue.enqueue(
    CRON_JOB_NAME,
    {
      message: "From /api/cron",
    },
    {
      runEvery: "PT5M", // 5m interval
    }
  );

  res.status(200).json({
    message: "Successfully started cron",
    job,
  });
}
