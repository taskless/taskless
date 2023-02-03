import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import reset from "../queues/reset";

type Data = {
  ok: boolean;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  console.info("⤵️   Making request via reset-fast");

  if (!req.body.email) {
    throw new Error("no email");
  }
  const email = (
    Array.isArray(req.body.email) ? req.body.email : [req.body.email]
  )[0];

  const key = crypto
    .createHash("sha256")
    .update(email ?? "")
    .digest("hex")
    .toString();

  await reset.enqueue(key, { email }, { retries: 3 });

  res.status(200).json({ ok: true });
};

export default handler;
