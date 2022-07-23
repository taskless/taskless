import { NextApiRequest, NextApiResponse } from "next";
import SampleQueue from "./queues/sample";

const DELAYED_JOB_NAME = "delayed";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const job = await SampleQueue.cancel(DELAYED_JOB_NAME);

  res.status(200).json({
    message: "Successfully cancelled delayed job",
    job,
  });
}
