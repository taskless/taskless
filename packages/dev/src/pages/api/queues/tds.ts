import { createQueue, JobError } from "@taskless/next";

type TDSQueue = Record<string, unknown>;

export default createQueue<TDSQueue>(
  "Sample Queue",
  "/api/queues/sample",
  async (job, taskless) => {
    console.log("Received with metadata", taskless);
    console.log(job);

    // pretend work is being done
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    if (job?.message === "force-fail") {
      console.log("Requested a failure condition");
      throw new JobError("Forced failure of job");
    }

    if (job?.message === "force-503") {
      console.log("Requested a 503 retry condition");
      throw new JobError("Forced unavailable", {
        retryAfter: 86400,
      });
    }

    return {
      success: true,
      metadata: taskless,
      original: job,
    };
  },
  {
    baseUrl: "http://localhost:3001",
    __dangerouslyAllowUnverifiedSignatures: {
      allowed: true, // allow unsigned signatures
    },
  }
);
