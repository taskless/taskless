import type {
  DeleteJobMutationRPC,
  DeleteJobMutationRPCResponse,
  RPCOperation,
} from "@taskless/client/dev";
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
  const ex = await db.get(id);
  if (!ex) {
    return {
      deleteJob: null,
    };
  }

  try {
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
    return {
      deleteJob: null,
    };
  }
};
