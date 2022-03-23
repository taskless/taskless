import { createQueue } from "@taskless/client/express";

export default createQueue("/queues/sample", async (job, meta) => {
  console.log("Received a job with payload and meta:", job, meta);
  return {
    about: [
      "This entire JSON object is returned to Taskless on success.",
      "If an unhandled exception is thrown, the error is captured and sent",
      "back to Taskless as an error JSON containing 'route', 'error', 'details',",
      "and 'stack'.",
    ],
  };
});