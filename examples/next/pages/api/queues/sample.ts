// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { createQueue } from "../../../../../packages/taskless/dist/esm/next";

type SampleQueue = {
  foo: string;
};

export default createQueue<SampleQueue>(
  "/api/queues/sample",
  async (job, meta) => {
    console.log("Received a job with payload and meta:", job, meta);
    return {
      about: [
        "This entire JSON object is returned to Taskless on success.",
        "If an unhandled exception is thrown, the error is captured and sent",
        "back to Taskless as an error JSON containing 'route', 'error', 'details',",
        "and 'stack'.",
      ],
    };
  },
  // you may also just set these in process.env and let Taskless use them directly
  {
    baseUrl: process.env.TASKLESS_BASE_URL,
    credentials: {
      appId: `${process.env.TASKLESS_APP_ID}`,
      secret: `${process.env.TASKLESS_SECRET}`,
    },
  }
);
