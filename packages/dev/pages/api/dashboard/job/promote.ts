import { DateTime } from "luxon";
import type { NextApiRequest, NextApiResponse } from "next";
import { Job } from "types.js";
import { jobs } from "worker/db";

export type PromoteJobResponse =
  | Job
  | {
      error: string;
    };

import { logger } from "winston/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PromoteJobResponse>
) {
  const db = await jobs.connect();
  const id = Array.isArray(req.body.id) ? req.body.id[0] : req.body.id;

  try {
    const job = await db.get(id);
    job.schedule.next = DateTime.now().toMillis();
    await db.put(job);
    const next = await db.get(id);
    res.status(200).json(next);
    return;
  } catch (e) {
    logger.error(e);
    res.status(500).json({
      error: e instanceof Error ? e.message : `${e}`,
    });
  }
}
