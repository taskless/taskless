// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { createQueue, JobError } from "@taskless/client/next";

type SampleQueue = {
  message: string;
};

export default createQueue<SampleQueue>(
  "/api/queues/sample",
  async (job, taskless) => {
    console.log("Echoing recevied message: " + job.message);

    if (job.message === "force-fail") {
      throw new JobError("Forced failure of job");
    }

    if (job.message === "force-503") {
      throw new JobError("Forced unavailable", {
        retryAfter: 86400,
      });
    }

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
