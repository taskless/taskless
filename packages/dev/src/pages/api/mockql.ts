// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { type NextApiRequest, type NextApiResponse } from "next";
import { updateJob } from "graphql-operations/updateJob";
import { v5 } from "uuid";
import { deleteJob } from "graphql-operations/deleteJob";
import { getJobByName } from "graphql-operations/getJobByName";
import { enqueueJob } from "graphql-operations/enqueueJob";
import cors from "nextjs-cors";
import { parse, type DocumentNode } from "graphql";
import {
  type DeleteJobMutationVariables,
  type EnqueueJobMutationVariables,
  type GetJobByNameQueryVariables,
  type UpdateJobMutationVariables,
} from "__generated__/schema";

const initAppId = "00000000-0000-0000-0000-000000000000";

const getOperationDetails = (ast: DocumentNode) => {
  const operations: {
    type: string;
    name: string;
  }[] = [];

  for (const def of ast.definitions) {
    if (def.kind === "OperationDefinition") {
      operations.push({
        type: def.operation,
        name: def.name?.value ?? "unknown",
      });
    }
  }

  return operations;
};

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
  const query: string = (req.body?.body ?? "").trim();
  const variables: {
    [name: string]: any;
  } = req.body?.variables ?? {};

  const headerAppId = Array.isArray(req.headers["x-taskless-app-id"])
    ? req.headers["x-taskless-app-id"][0]
    : req.headers["x-taskless-app-id"];
  const appId = headerAppId ? headerAppId : initAppId;
  const context = {
    v5: (value: string) => v5(value, appId),
  };

  const ast = parse(query ?? "");
  const details = getOperationDetails(ast);

  // collected results
  let results: Record<string, unknown> = {};

  for (const act of details) {
    if (act.type === "mutation" && act.name === "deleteJob") {
      const r = await deleteJob(
        variables as DeleteJobMutationVariables,
        context
      );
      results = {
        ...results,
        ...r,
      };
    } else if (act.type === "mutation" && act.name === "enqueueJob") {
      const r = await enqueueJob(
        variables as EnqueueJobMutationVariables,
        context
      );
      results = {
        ...results,
        ...r,
      };
    } else if (act.type === "mutation" && act.name === "updateJob") {
      const r = await updateJob(
        variables as UpdateJobMutationVariables,
        context
      );
      results = {
        ...results,
        ...r,
      };
    } else if (act.type === "query" && act.name === "getJobByName") {
      const r = await getJobByName(
        variables as GetJobByNameQueryVariables,
        context
      );
      results = {
        ...results,
        ...r,
      };
    }
  }

  res.status(200).json({ data: results });
}
