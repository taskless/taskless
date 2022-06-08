import { Job, jobToJobFragment } from "mongo/db";
import {
  DeleteJobMutation,
  DeleteJobMutationVariables,
} from "../__generated__/schema";

export const deleteJob = async (
  variables: DeleteJobMutationVariables,
  context: any
): Promise<DeleteJobMutation> => {
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
