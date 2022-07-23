import type { NextApiRequest, NextApiResponse } from "next";
import bp from "boolean-parser";
import { bqToMango, jobFacets } from "util/bqToMango";
import { getJobsCollection, JobDoc } from "mongo/collections";

type ErrorResponse = {
  error: string;
};

export type GetJobsResponse = {
  jobs: JobDoc[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetJobsResponse | ErrorResponse>
) {
  const q = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
  const m = q ? bqToMango(bp.parseBooleanQuery(q), jobFacets) : null;

  const jc = await getJobsCollection();

  const jobs = await jc
    .find({
      ...(m ?? {}),
    })
    .sort({
      lastRun: 1,
    })
    .toArray();

  res.status(200).json({
    jobs,
  });
}
