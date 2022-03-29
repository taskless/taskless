import type {
  DeleteJobMutationRPC,
  DeleteJobMutationRPCResponse,
  RPCOperation,
} from "@taskless/client/dev";
import { isPouchError } from "types";
import { logger } from "winston/logger";
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
  const db = await jobs.connect();

  try {
    const ex = await db.get(id);
    if (!ex) {
      return {
        deleteJob: null,
      };
    }

    await unschedule(id);

    const toDelete = await db.get(id);
    await db.put({
      ...toDelete,
      _deleted: true,
    });

    const job = await db.get(id);
    return {
      deleteJob: {
        ...jobToJobFragment(variables.name, job),
      },
    };
  } catch (e) {
    if ((isPouchError(e) && e.status === 404) || !isPouchError(e)) {
      return {
        deleteJob: null,
      };
    }

    // rethrow as unhandled
    throw e;
  }
};
