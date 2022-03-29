import { DateTime } from "luxon";
import { NextApiRequest, NextApiResponse } from "next";
import SampleQueue from "./queues/sample";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const job = await SampleQueue.enqueue("sample", {
    foo: "success",
  });

  const delayed = await SampleQueue.enqueue(
    "delayed-job",
    {
      foo: "This is delayed for 3 days",
    },
    {
      runAt: DateTime.now().plus({ days: 3 }).toISO(),
    }
  );

  res.status(200).json({
    message: [`Immediate job: ${job.name}`, `Delayed job: ${delayed.name}`],
    job,
    delayed,
  });
}
