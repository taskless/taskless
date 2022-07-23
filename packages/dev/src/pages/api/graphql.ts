// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { parse, type DocumentNode } from "graphql";
import { cancelJob } from "graphql-operations/cancelJob";
import { enqueueJob } from "graphql-operations/enqueueJob";
import { type NextApiRequest, type NextApiResponse } from "next";
import cors from "nextjs-cors";
import { v5 } from "uuid";
import {
  type CancelJobMutationVariables,
  type EnqueueJobMutationVariables,
} from "__generated__/schema";

const nilId = "00000000-0000-0000-0000-000000000000";

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
  const query: string = (req.body?.query ?? "").trim();
  const variables: {
    [name: string]: any;
  } = req.body?.variables ?? {};

  const headerAppId = Array.isArray(req.headers["x-taskless-app-id"])
    ? req.headers["x-taskless-app-id"][0]
    : req.headers["x-taskless-app-id"];
  const headerOrgId = Array.isArray(req.headers["x-taskless-organization-id"])
    ? req.headers["x-taskless-organization-id"][0]
    : req.headers["x-taskless-organization-id"];
  const appId = headerAppId ? headerAppId : nilId;
  const orgId = headerOrgId ? headerOrgId : nilId;
  const context = {
    applicationId: appId,
    organizationId: orgId,
    v5: (value: string) => v5(value, appId),
  };

  const ast = parse(query ?? "");
  const details = getOperationDetails(ast);

  // collected results
  let results: Record<string, unknown> = {};

  for (const act of details) {
    if (act.type === "mutation" && act.name === "cancelJob") {
      const r = await cancelJob(
        variables as CancelJobMutationVariables,
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
    }
  }

  res.status(200).json({ data: results });
}
