import { DateTime } from "luxon";
import type { NextApiRequest, NextApiResponse } from "next";
import { Job } from "types.js";
import { jobs } from "worker/db";

export type GetScheduledJobsResponse = Job[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetScheduledJobsResponse>
) {
  const after = Array.isArray(req.query.after)
    ? req.query.after[0]
    : req.query.after;
  const now = DateTime.now();
  const db = await jobs.connect();
  const next = await db.find({
    selector: {
      "schedule.check": {
        $eq: true,
      },
      "schedule.next": {
        $gt: after ?? now.toISO(),
      },
    },
    sort: [{ "schedule.next": "desc" }],
  });

  // remove log data from schedule pane
  const all = next.docs.map((job) => {
    delete job["logs"];
    return job;
  });

  res.status(200).json(all);
}
