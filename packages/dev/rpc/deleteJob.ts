import type {
  DeleteJobMutationRPC,
  DeleteJobMutationRPCResponse,
  RPCOperation,
} from "@taskless/client/dev";
import { Job, jobToJobFragment } from "mongo/db";
import { start } from "worker/loop";

export const isDeleteJob = (v: RPCOperation): v is DeleteJobMutationRPC => {
  return v.method === "deleteJob";
};

export const deleteJob = async (
  variables: DeleteJobMutationRPC["variables"],
  context: any
): Promise<DeleteJobMutationRPCResponse["data"]> => {
  start();
  const id = context.v5(variables.name);

  const job = await Job.findOneAndDelete(
    {
      v5id: {
        $eq: id,
      },
    },
    {
      returnDocument: "before",
    }
  ).exec();

  if (!job) {
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
