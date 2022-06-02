import type { NextApiRequest, NextApiResponse } from "next";
import { watch } from "worker/loop";

/** Stats a worker cron that polls and manages events in development */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  watch();
  return res.status(200).json({
    watch: true,
  });
}
