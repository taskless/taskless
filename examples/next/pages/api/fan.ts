import { NextApiRequest, NextApiResponse } from "next";
import Fan from "./queues/fan-out";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const users = ["alice", "bob", "carla"];
  await Fan.enqueue("fan-start", {
    users,
    message: "fanned-out",
  });

  res.status(200).json({
    message: "Scheduled fan out work",
  });
}
