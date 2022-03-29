import type { NextApiRequest, NextApiResponse } from "next";
import { LogEntry } from "types.js";
import { jobs } from "worker/db";

export type JobLogsResponse = {
  id: string;
  logs: LogEntry[];
};

type ErrorResponse = {
  error: string;
};

import { logger } from "winston/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<JobLogsResponse | ErrorResponse>
) {
  const db = await jobs.connect();
  const id = Array.isArray(req.body.id) ? req.body.id[0] : req.body.id;

  try {
    const job = await db.get(id);
    const logs = job.logs ?? [];
    res.status(200).json({
      id,
      logs: logs.reverse(),
    });
  } catch (e) {
    logger.error(e);
    res.status(500).json({
      error: e instanceof Error ? e.message : `${e}`,
    });
  }
}
