import { NextApiRequest, NextApiResponse } from "next";
import TestQueue from "./queues/test";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const job = await TestQueue.enqueue(
    "production test",
    {
      message: "Production test OK",
    },
    {
      retries: 0,
    }
  );

  res.status(200).json({
    message: "Production Queue - Scheduled immediate work",
    job,
  });
}
