import { createQueue } from "@taskless/express";

// an async function that emulates work being done
const sleep = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 100);
  });

export default createQueue(
  "Sample Queue",
  "/queues/sample",
  async (job, meta) => {
    console.log("Received a job with payload and meta:", job, meta);
    await sleep();
    return {
      about: [
        "This entire JSON object is returned to Taskless on success.",
        "If an unhandled exception is thrown, the error is captured and sent",
        "back to Taskless as an error JSON containing 'route', 'error', 'details',",
        "and 'stack'.",
      ],
    };
  }
);
