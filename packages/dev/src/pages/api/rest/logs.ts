import type { NextApiRequest, NextApiResponse } from "next";
import bp from "boolean-parser";
import { bqToMango, runFacets } from "util/bqToMango";
import { getRunsCollection, RunDoc } from "mongo/collections";

type ErrorResponse = {
  error: string;
};

export type GetLogsResponse = {
  runs: RunDoc[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetLogsResponse | ErrorResponse>
) {
  const q = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
  const m = q ? bqToMango(bp.parseBooleanQuery(q), runFacets) : null;

  // console.log(JSON.stringify(m));

  const runs = await getRunsCollection();
  const r = await runs
    .find({
      ...(m ?? {}),
    })
    .sort({ ts: -1 })
    .toArray();

  res.status(200).json({
    runs: r,
  });
}
