import type { NextApiRequest, NextApiResponse } from "next";
import { Document, Job, JobLog } from "types.js";
import { jobs, logs } from "worker/db";
import { logger } from "winston/logger";

type JobWithResolvedFields = Document<Job> & {
  lastLog?: Document<JobLog>;
};

type ErrorResponse = {
  error: string;
};

export type GetJobsResponse = {
  jobs: JobWithResolvedFields[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetJobsResponse | ErrorResponse>
) {
  const db = await jobs.connect();
  const ldb = await logs.connect();
  const filters = Array.isArray(req.query.filters)
    ? req.query.filters[0]
    : req.query.filters;
  const mango = filters ? JSON.parse(filters) : null;

  try {
    const result = await db.find({
      selector: {
        updatedAt: {
          $exists: true,
        },
        ...(mango
          ? {
              $and: mango,
            }
          : {}),
      },
      sort: [{ updatedAt: "desc" }],
    });

    const next = await Promise.all(
      result.docs.map(async (doc: JobWithResolvedFields) => {
        const ll = await ldb.find({
          selector: {
            jobId: {
              $eq: doc._id,
            },
            createdAt: {
              $exists: true,
            },
          },
          sort: [{ createdAt: "desc" }],
          limit: 1,
        });
        doc.lastLog = ll.docs[0];
        return doc;
      })
    );

    res.status(200).json({
      jobs: next,
    });
  } catch (e) {
    logger.error(e);
    res.status(500).json({
      error: e instanceof Error ? e.message : `${e}`,
    });
  }
}
