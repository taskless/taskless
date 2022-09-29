import type { NextApiRequest, NextApiResponse } from "next";
import bp from "boolean-parser";
import { bqToMango, runFacets } from "util/bqToMango";
import { getCollection, RunDoc } from "db/loki";

type ErrorResponse = {
  error: string;
};

export type GetLogsResponse = {
  runs: RunDoc[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetLogsResponse | ErrorResponse>
) {
  const q = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
  const m = q ? bqToMango(bp.parseBooleanQuery(q), runFacets) : null;

  // console.log(JSON.stringify(m));

  const runs = getCollection<RunDoc>("runs");
  const r = runs
    .chain()
    .find({
      ...(m ?? {}),
    })
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .data();

  res.status(200).json({
    runs: r,
  });
}
