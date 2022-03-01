import { NextApiRequest, NextApiResponse } from "next";
import SampleQueue from "./queues/sample";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const job = await SampleQueue.enqueue(null, {
    foo: "success",
  });
  res
    .status(200)
    .json({
      message: "Job was scheduled successfully with name: " + job.name,
      job,
    });
}
