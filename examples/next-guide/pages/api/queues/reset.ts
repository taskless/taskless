import { createQueue } from "@/../../packages/next";
import { performSlowGlitchyPasswordReset } from "../auth/reset-slow";

interface ResetData {
  email: string;
}

export default createQueue<ResetData>(
  "password-reset",
  "/api/queues/reset",
  async (job, api) => {
    console.info("⤵️   Running Taskless Background Job");
    await performSlowGlitchyPasswordReset();
    return { ok: true };
  }
);
