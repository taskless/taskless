import { NextApiRequest, NextApiResponse } from "next";
import SampleQueue from "./queues/sample";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const names = ["bulk-one", "bulk-two", "bulk-three"];

  const [jobs, errors] = await SampleQueue.bulk.enqueue(
    names.map((n) => ({
      name: n,
      payload: {
        message: `This is ${n} in a batch operation`,
      },
      options: {
        retries: 1,
      },
    }))
  );

  res.status(200).json({
    message: "Scheduled bulk work",
    jobs,
    errors,
  });
}
