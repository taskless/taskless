import type {
  GetJobQueryRPC,
  GetJobQueryRPCResponse,
  RPCOperation,
} from "@taskless/client/dev";
import { jobs, jobToJobFragment } from "worker/db";
import { start } from "worker/loop";

export const isGetJobByName = (v: RPCOperation): v is GetJobQueryRPC => {
  return v.method === "getJobByName";
};

export const getJobByName = async (
  variables: GetJobQueryRPC["variables"],
  context: any
): Promise<GetJobQueryRPCResponse["data"]> => {
  start();
  const id = context.v5(variables.name);
  const db = await jobs.connect();

  const job = await db.get(id);
  if (!job) {
    return null;
  }

  return {
    job: {
      ...jobToJobFragment(variables.name, job),
    },
  };
};
