import type { DEV } from "@taskless/client";
import { Job, jobToJobFragment } from "mongo/db";
import { start } from "worker/loop";

// local types
type RPCOperation = DEV["RPCOperation"];
type GetRPC = DEV["RPCMethods"]["Get"]["Request"];
type GetResponse = DEV["RPCMethods"]["Get"]["Response"];

export const isGetJobByName = (v: RPCOperation): v is GetRPC => {
  return v.method === "getJobByName";
};

export const getJobByName = async (
  variables: GetRPC["variables"],
  context: any
): Promise<GetResponse["data"]> => {
  start();
  const id = context.v5(variables.name);

  const job = await Job.findOne({
    v5id: {
      $eq: id,
    },
  }).exec();

  if (!job) {
    return null;
  }

  return {
    job: {
      ...jobToJobFragment(job.name, job),
    },
  };
};
