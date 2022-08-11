import { createQueue, JobError } from "@taskless/next";
import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";

type TestQueue = {
  message: string;
};

const withIntercept = (fn: NextApiHandler) => {
  const h: NextApiHandler = async (req, res) => {
    // allow cors proxy for tools like webhook.site
    await NextCors(req, res, {
      methods: ["GET", "POST"],
      origin: "*",
      optionsSuccessStatus: 200,
    });

    // call original queue function
    return fn(req, res);
  };
  return h;
};

// test queue used for performing a test
const queue = createQueue<TestQueue>(
  "test", // <= must exist in your taskless.io project
  "/api/queues/test",
  async (job) => {
    console.log("Echoing recevied message: " + job.message);

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

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
  }
);

export default queue.withQueue(withIntercept(queue));
