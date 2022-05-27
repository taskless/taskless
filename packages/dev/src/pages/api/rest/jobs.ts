import type { NextApiRequest, NextApiResponse } from "next";
import bp from "boolean-parser";
import { bqToMango, jobFacets } from "util/bqToMango";
import { Job, JobDoc, MongoResult } from "mongo/db";

type ErrorResponse = {
  error: string;
};

export type GetJobsResponse = {
  jobs: MongoResult<JobDoc>[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetJobsResponse | ErrorResponse>
) {
  const q = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
  const m = q ? bqToMango(bp.parseBooleanQuery(q), jobFacets) : null;

  const jobs = await Job.find({
    ...(m ?? {}),
  })
    .populate({
      path: "logs",
      options: {
        sort: {
          createdAt: "desc",
        },
        limit: 1,
      },
    })
    .sort({
      updatedAt: "desc",
    })
    .exec();

  res.status(200).json({
    jobs,
  });
}
