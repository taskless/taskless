import type { NextApiRequest, NextApiResponse } from "next";
import { Document, Job } from "types.js";
import { jobs } from "worker/db";
import { logger } from "winston/logger";
import { DateTime } from "luxon";
import { scheduleNext } from "worker/scheduler";

type ErrorResponse = {
  error: string;
};

export type PromoteJobResponse = {
  job: Document<Job>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PromoteJobResponse | ErrorResponse>
) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  try {
    const db = await jobs.connect();
    const doc = await db.get(id);
    doc.data.runAt = DateTime.now().toISO();
    await db.put(doc);
    const result = await scheduleNext(id);
    return res.status(200).json({
      job: result,
    });
  } catch (e) {
    logger.error(e);
    res.status(500).json({
      error: e instanceof Error ? e.message : `${e}`,
    });
  }
}
