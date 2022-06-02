import type { DEV } from "@taskless/client";
import { Job, jobToJobFragment } from "mongo/db";

// local types
type RPCOperation = DEV["RPCOperation"];
type DeleteRPC = DEV["RPCMethods"]["Delete"]["Request"];
type DeleteResponse = DEV["RPCMethods"]["Delete"]["Response"];

export const isDeleteJob = (v: RPCOperation): v is DeleteRPC => {
  return v.method === "deleteJob";
};

export const deleteJob = async (
  variables: DeleteRPC["variables"],
  context: any
): Promise<DeleteResponse["data"]> => {
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
