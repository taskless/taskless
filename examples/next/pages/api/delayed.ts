import { DateTime } from "luxon";
import { NextApiRequest, NextApiResponse } from "next";
import SampleQueue from "./queues/sample";

const DELAYED_JOB_NAME = "delayed";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const job = await SampleQueue.enqueue(
    DELAYED_JOB_NAME,
    {
      message: "Message from a delayed job, 3 days into the future",
    },
    {
      runAt: DateTime.now().plus({ days: 3 }).toISO(),
    }
  );

  res.status(200).json({
    message: "Successfully scheduled delayed job",
    job,
  });
}
