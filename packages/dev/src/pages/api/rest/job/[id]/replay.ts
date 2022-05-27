import type { NextApiRequest, NextApiResponse } from "next";
import { Job, JobDoc, MongoResult } from "mongo/db";

type ErrorResponse = {
  error: string;
};

export type ReplayJobResponse = {
  job: MongoResult<JobDoc>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReplayJobResponse | ErrorResponse>
) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  const job = await Job.findOneAndUpdate(
    {
      _id: { $eq: id },
    },
    {
      $set: {
        schedule: {
          next: new Date(),
          attempt: 0,
        },
      },
    },
    {
      returnDocument: "after",
    }
  );

  if (!job) {
    return res.status(500).json({
      error: "No job to promote",
    });
  }

  res.status(200).json({
    job,
  });
}
