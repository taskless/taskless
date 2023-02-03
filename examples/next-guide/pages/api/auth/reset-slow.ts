import type { NextApiRequest, NextApiResponse } from "next";
import { sleep } from "../../../util/sleep";

type Data = {
  ok: boolean;
};

/** Simulate the multiple steps of a password reset, including possible failures */
export const performSlowGlitchyPasswordReset = async () => {
  await sleep(80, "Check abuse rate limits");
  await sleep(100, "Lookup user by email");
  await sleep(7, "Save reset token");

  const failure = 0.6;
  if (Math.random() <= failure) {
    await sleep(
      7000,
      "Call Mail Service API",
      "Call Mail Service API Timed Out (7s)"
    );
    throw new Error("Service Timed Out");
  } else {
    return sleep(300, "Call Mail Service API");
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  console.info("⤵️   Making request via reset-slow");
  try {
    await performSlowGlitchyPasswordReset();
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
};

export default handler;
