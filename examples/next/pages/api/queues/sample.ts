// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { createQueue } from "@taskless/client/next";

type SampleQueue = {
  message: string;
};

export default createQueue<SampleQueue>(
  "/api/queues/sample",
  async (job, meta) => {
    console.log("Echoing recevied message: " + job.message);
    return {
      success: true,
      originalMessage: job.message,
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
