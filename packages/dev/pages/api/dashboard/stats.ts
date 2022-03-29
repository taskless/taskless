import type { NextApiRequest, NextApiResponse } from "next";
import { jobs } from "worker/db";

export type GetDashboardStatsResponse = {
  scheduled: number;
  completed: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetDashboardStatsResponse>
) {
  const db = await jobs.connect();

  const completed = await db.find({
    selector: {
      lastLog: {
        $exists: true,
      },
    },
  });

  const scheduled = await db.find({
    selector: {
      "schedule.check": {
        $eq: true,
      },
    },
  });

  res.status(200).json({
    scheduled: scheduled.docs.length,
    completed: completed.docs.length,
  });
}
