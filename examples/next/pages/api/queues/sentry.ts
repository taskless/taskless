import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { createQueue } from "@taskless/client/next";

// stubbed out to demonstrate sentry's wrapper of the next handler
// where queue methods were hidden one layer deep by sentry's api handler
function withSentry(h: NextApiHandler): NextApiHandler {
  return (req: NextApiRequest, res: NextApiResponse) => h(req, res);
}

type SampleQueue = {
  message: string;
};

const queue = createQueue<SampleQueue>(
  "/api/queues/sentry",
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

export default queue.withQueue(withSentry(queue));
