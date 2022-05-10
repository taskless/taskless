// a simple echo endpoint used to verify connectivity
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("ECHO ENDPOINT");
  console.log(req.body);
  res.status(200).json({});
}
