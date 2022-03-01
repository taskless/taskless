// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { createQueue } from "../../../../../packages/taskless/dist/cjs/next";

type SampleQueue = {
  foo: string;
};

export default createQueue<SampleQueue>(
  "/api/queues/sample",
  async (job, meta) => {
    console.log("Received a job with payload and meta:", job, meta);
  },
  {
    baseUrl: process.env.TASKLESS_BASE_URL,
    credentials: {
      appId: `${process.env.TASKLESS_APP_ID}`,
      secret: `${process.env.TASKLESS_SECRET}`,
    },
  }
);
