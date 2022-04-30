import type { NextApiRequest, NextApiResponse } from "next";
import { Document, Job, JobLog } from "types.js";
import { jobs, logs } from "worker/db";
import { logger } from "winston/logger";

type LogWithResolvedFields = Document<JobLog> & {
  job?: Document<Job>;
};

type ErrorResponse = {
  error: string;
};

export type GetLogsResponse = {
  logs: LogWithResolvedFields[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetLogsResponse | ErrorResponse>
) {
  const db = await jobs.connect();
  const ldb = await logs.connect();
  const filters = Array.isArray(req.query.filters)
    ? req.query.filters[0]
    : req.query.filters;
  const mango = filters ? JSON.parse(filters) : null;

  try {
    const result = await ldb.find({
      selector: {
        createdAt: {
          $exists: true,
        },
        ...(mango
          ? {
              $and: [mango],
            }
          : {}),
      },
      sort: [{ createdAt: "desc" }],
    });

    const next = await Promise.all(
      result.docs.map(async (doc: LogWithResolvedFields) => {
        const j = await db.get(doc.jobId);
        doc.job = j;
        return doc;
      })
    );

    res.status(200).json({
      logs: next,
    });
  } catch (e) {
    logger.error(e);
    res.status(500).json({
      error: e instanceof Error ? e.message : `${e}`,
    });
  }
}
