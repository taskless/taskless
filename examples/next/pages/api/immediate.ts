import { NextApiRequest, NextApiResponse } from "next";
import SampleQueue from "./queues/sample";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const job = await SampleQueue.enqueue(
    "ex-immediately",
    {
      message: "This job runs immediately after being enqueued",
    },
    {
      retries: 1,
    }
  );

  res.status(200).json({
    message: "Scheduled immediate work",
    job,
  });
}
