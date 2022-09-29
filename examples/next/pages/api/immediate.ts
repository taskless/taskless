import { NextApiRequest, NextApiResponse } from "next";
import SampleQueue from "./queues/sample";

const first = (s: unknown): string | undefined => {
  return Array.isArray(s) ? `${s[0]}` : `${s}`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const name = first(req.query.name) ?? "ex-immediately";

  const job = await SampleQueue.enqueue(
    name,
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
