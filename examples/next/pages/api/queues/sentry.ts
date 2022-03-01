// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// import { withSentry } from "@sentry/nextjs";
// import { createQueue } from "../../../../../packages/taskless/dist/cjs/next";

import { NextApiRequest, NextApiResponse } from "next";

// type SampleQueue = {
//   foo: string;
// };

// const q = createQueue<SampleQueue>(
//   "/api/queues/sample",
//   async (job, meta) => {
//     console.log("Received a job with payload and meta:", job, meta);
//   },
//   {
//     baseUrl: process.env.TASKLESS_BASE_URL,
//     credentials: {
//       appId: `${process.env.TASKLESS_APP_ID}`,
//       secret: `${process.env.TASKLESS_SECRET}`,
//     },
//   }
// );

// export default q.withQueue(withSentry(q));

export default function SentryExample(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(500).json({ message: "Not enabled. Uncomment and set up sentry" });
}
