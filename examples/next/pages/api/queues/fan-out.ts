// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { createQueue } from "@taskless/next";

type FanOutQueue = {
  users?: string[];
  user?: string;
  message: string;
};

// an async function that emulates work being done
const sleep = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 100);
  });

export default createQueue<FanOutQueue>(
  "Fan Out Queue",
  "/api/queues/fan-out",
  async (job, taskless) => {
    console.log("Echoing recevied message: " + job.message);
    await sleep();

    if (typeof job.users !== "undefined") {
      // fan
      const result = await taskless.queue.bulk.enqueue(
        job.users.map((u) => ({
          name: ["fan", u],
          payload: {
            user: u,
            message: job.message,
          },
        }))
      );
      return {
        bulk: true,
        result,
      };
    }

    // instance
    console.log(`fan-out for user "${job.user}"`);

    return {
      success: true,
      user: job.user,
      originalMessage: job.message,
    };
  }
);
