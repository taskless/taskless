// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { graphql } from "@taskless/types";
import { cancelJob } from "graphql-operations/cancelJob";
import { enqueueJob } from "graphql-operations/enqueueJob";
import { type NextApiRequest, type NextApiResponse } from "next";
import cors from "nextjs-cors";
import { Context } from "types";
import { v5 } from "uuid";

const nilId = "00000000-0000-0000-0000-000000000000";

/** A simplified mock graphql server that emulates for.taskless.io calls */
export default async function MockGraphqlServer(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await cors(req, res, {
    methods: ["GET", "HEAD", "POST"],
    origin: "*",
    optionsSuccessStatus: 204,
  });

  // gql items from request body
  // const operationName: string = req.body?.operationName ?? "";
  const query: string = (req.body?.query ?? "").trim();
  const variables: {
    [name: string]: unknown;
  } = req.body?.variables ?? {};

  const projectId = Array.isArray(req.headers["x-taskless-id"])
    ? req.headers["x-taskless-id"][0]
    : req.headers["x-taskless-id"];

  const queueName = Array.isArray(req.headers["x-taskless-queue"])
    ? req.headers["x-taskless-queue"][0]
    : req.headers["x-taskless-queue"];

  const context: Context = {
    projectId:
      typeof projectId === "string" && projectId.length > 0 ? projectId : nilId,
    queueName:
      typeof queueName === "string" && queueName.length > 0
        ? queueName
        : "default",
    v5: (value: string) => v5(value, projectId ?? nilId),
  };

  // collected results
  let results: Record<string, unknown> = {};

  if (/mutation\s+cancelJob\(/.test(query)) {
    const r = await cancelJob(
      variables as graphql.CancelJobMutationVariables,
      context
    );
    results = {
      ...results,
      ...r,
    };
  }

  if (/mutation\s+enqueueJob\(/.test(query)) {
    const r = await enqueueJob(
      variables as graphql.EnqueueJobMutationVariables,
      context
    );
    results = {
      ...results,
      ...r,
    };
  }

  res.status(200).json({ data: results });
}
