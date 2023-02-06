import { createQueue } from "@/../../packages/next";

interface DailyBriefing {
  userId: string;
}

/**
 * The "Daily Briefing" example
 */
export default createQueue<DailyBriefing>(
  "daily-briefing",
  "/api/queues/briefing",
  async (job, api) => {
    console.info(`Daily briefing for ${job.userId}`);
    return { ok: true };
  }
);
