import type { NextApiRequest, NextApiResponse } from "next";
import { bqToMango, logFacets } from "util/bqToMango";
import bp from "boolean-parser";
import { JobDoc, Log, LogDoc } from "mongo/db";

type LogWithResolvedFields = LogDoc & {
  job?: JobDoc;
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
  const q = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
  const m = q ? bqToMango(bp.parseBooleanQuery(q), logFacets) : null;

  const logs = await Log.find({
    ...(m ?? {}),
  })
    .sort({ createdAt: "desc" })
    .populate("job")
    .exec();

  return res.status(200).json({
    logs,
  });
}
