import type { NextApiRequest, NextApiResponse } from "next";
import { Job } from "types.js";
import { jobs } from "worker/db";

export type GetCompletedJobsResponse = Job[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetCompletedJobsResponse>
) {
  const db = await jobs.connect();
  const next = await db.find({
    selector: {
      // allow all logs for now
      // lastLog: {
      //   $gte: after ?? now.minus({ minutes: 5 }).toISO(),
      // },
    },
    sort: [{ lastLog: "desc" }],
  });

  // remove log data from schedule pane
  const all = next.docs.map((job) => {
    delete job["logs"];
    return job;
  });

  res.status(200).json(all);
}
