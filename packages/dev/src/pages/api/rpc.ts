// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { isUpdateJob, updateJob } from "rpc/updateJob";
import { v5 } from "uuid";
import { deleteJob, isDeleteJob } from "rpc/deleteJob";
import { getJobByName, isGetJobByName } from "rpc/getJobByName";
import { enqueueJob, isEnqueueJob } from "rpc/enqueueJob";
import { logger } from "winston/logger";

const initAppId = "00000000-0000-0000-0000-000000000000";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const headerAppId = Array.isArray(req.headers["x-taskless-app-id"])
    ? req.headers["x-taskless-app-id"][0]
    : req.headers["x-taskless-app-id"];
  const appId = headerAppId ? headerAppId : initAppId;
  const context = {
    v5: (value: string) => v5(value, appId),
  };

  logger.info(`Received request for Application ID ${appId}`);

  // success operation
  const success = (v: any) => {
    res.status(200).json({
      data: v,
    });
  };

  const error = (v: any) => {
    logger.error(v);
    res.status(500).json({
      error: v,
      data: null,
    });
  };

  try {
    if (isEnqueueJob(req.body)) {
      const v = await enqueueJob(req.body.variables, context);
      logger.info(`Enqueing Job: ${req.body.variables.name}`);
      return success(v);
    }
    if (isUpdateJob(req.body)) {
      const v = await updateJob(req.body.variables, context);
      logger.info(`Updating Job: ${req.body.variables.name}`);
      return success(v);
    }
    if (isDeleteJob(req.body)) {
      const v = await deleteJob(req.body.variables, context);
      logger.info(`Deleting Job: ${req.body.variables.name}`);
      return success(v);
    }
    if (isGetJobByName(req.body)) {
      const v = await getJobByName(req.body.variables, context);
      logger.info(`Getting Job: ${req.body.variables.name}`);
      return success(v);
    }
  } catch (e) {
    if (process.env.TASKLESS_FULL_ERRORS === "1") {
      console.error(e);
    }
    return error(e);
  }

  logger.error("Unsupported RPC method: " + (req.body?.method ?? "unknown"));
  res.status(500).json({
    data: null,
    error: "Unsupported RPC method: " + (req.body?.method ?? "unknown"),
  });
}
