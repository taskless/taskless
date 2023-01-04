import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { createQueue } from "@taskless/next";

// stubbed out to demonstrate sentry's wrapper of the next handler
// where queue methods were hidden one layer deep by sentry's api handler
function withSentry(h: NextApiHandler): NextApiHandler {
  return (req: NextApiRequest, res: NextApiResponse) => h(req, res);
}

type SampleQueue = {
  message: string;
};

// an async function that emulates work being done
const sleep = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 100);
  });

const queue = createQueue<SampleQueue>(
  "Sentry Queue",
  "/api/queues/sentry",
  async (job, taskless) => {
    console.log("Echoing recevied message: " + job.message);
    await sleep();
    return {
      success: true,
      originalMessage: job.message,
    };
  },
  // you may also just set these in process.env and let Taskless use them directly
  {
    baseUrl: process.env.TASKLESS_BASE_URL,
    credentials: {
      projectId: `${process.env.TASKLESS_ID ?? ""}`,
      secret: `${process.env.TASKLESS_SECRET ?? ""}`,
    },
  }
);

export default queue.withQueue(withSentry(queue));
