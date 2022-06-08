import { Job, jobToJobFragment } from "mongo/db";
import {
  GetJobByNameQuery,
  GetJobByNameQueryVariables,
} from "__generated__/schema";

export const getJobByName = async (
  variables: GetJobByNameQueryVariables,
  context: any
): Promise<GetJobByNameQuery> => {
  const id = context.v5(variables.name);

  const job = await Job.findOne({
    v5id: {
      $eq: id,
    },
  }).exec();

  if (!job) {
    return {
      job: null,
    };
  }

  return {
    job: {
      ...jobToJobFragment(job.name, job),
    },
  };
};
