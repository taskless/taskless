import type { NextApiRequest, NextApiResponse } from "next";
import { DateTime } from "luxon";
import { sleep } from "@/util/sleep";
import briefing from "./queues/briefing";

type Data = {
  ok: boolean;
};

const validateSession = () => sleep(80, "Verify user is valid");

const getSession = async () => {
  // these values should come from your session
  return {
    userId: "03952ed3-d7be-4e26-874a-15052735ee9f",
  };
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  await validateSession();
  const { userId } = await getSession();

  const timezone = `${req.body.timezone ?? "UTC"}`;
  const now = DateTime.now().setZone(timezone);

  briefing.enqueue(
    `${userId}`,
    {
      userId,
    },
    {
      runAt: (now < now.set({ hour: 8, minute: 0, second: 0, millisecond: 0 })
        ? now.startOf("day").set({ hour: 8 })
        : now.startOf("day").plus({ days: 1 }).set({ hour: 8 })
      ).toISO(),
      runEvery: "P1D",
      timezone,
    }
  );

  res.status(200).json({ ok: true });
};

export default handler;
