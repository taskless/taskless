import { getDb } from "db/loki";
import { type NextApiRequest, type NextApiResponse } from "next";

/** View the loki data in storage */
export default function MockGraphqlServer(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = getDb();

  res.status(200).send(JSON.stringify(JSON.parse(db.serialize()), null, 2));
}
