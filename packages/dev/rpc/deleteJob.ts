import type {
  DeleteJobMutationRPC,
  DeleteJobMutationRPCResponse,
  RPCOperation,
} from "@taskless/client/dev";
import { Job } from "types";
import { jobs, jobToJobFragment } from "worker/db";
import { start } from "worker/loop";
import { unschedule } from "worker/scheduler";

export const isDeleteJob = (v: RPCOperation): v is DeleteJobMutationRPC => {
  return v.method === "deleteJob";
};

export const deleteJob = async (
  variables: DeleteJobMutationRPC["variables"],
  context: any
): Promise<DeleteJobMutationRPCResponse["data"]> => {
  start();
  const id = context.v5(variables.name);
  const job = await jobs.get(id);
  if (!job) {
    return {
      deleteJob: null,
    };
  }

  try {
    jobs.remove(job._id, job._rev);
    unschedule(job);
  } catch (e) {
    return {
      deleteJob: null,
    };
  }

  return {
    deleteJob: {
      ...jobToJobFragment(variables.name, job),
    },
  };
};
