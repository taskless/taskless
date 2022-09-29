import type { NextApiRequest, NextApiResponse } from "next";
import bp from "boolean-parser";
import { bqToMango, jobFacets } from "util/bqToMango";
import { getCollection, JobDoc } from "db/loki";

type ErrorResponse = {
  error: string;
};

export type GetJobsResponse = {
  jobs: JobDoc[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetJobsResponse | ErrorResponse>
) {
  const q = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
  const m = q ? bqToMango(bp.parseBooleanQuery(q), jobFacets) : null;

  const jc = getCollection<JobDoc>("jobs");

  const jobs = jc
    .chain()
    .find({
      ...(m ?? {}),
    })
    .sort((a, b) => {
      return (
        new Date(b.summary?.lastRun ?? 0).getTime() -
        new Date(a.summary?.lastRun ?? 0).getTime()
      );
    })
    .data();

  res.status(200).json({
    jobs,
  });
}
