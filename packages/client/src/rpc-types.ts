import { getSdk } from "./__generated__/schema.js";

import type {
  DeleteJobMutation,
  DeleteJobMutationVariables,
  EnqueueJobMutation,
  EnqueueJobMutationVariables,
  GetJobByNameQuery,
  GetJobByNameQueryVariables,
  UpdateJobMutation,
  UpdateJobMutationVariables,
} from "./__generated__/schema.js";

// expose schema calls to development client
export * from "./__generated__/schema.js";

/**
 * A Valid RPC Method from the SDK
 */
type ValidRPCMethod = keyof ReturnType<typeof getSdk>;

/** Helper type to construct an RPC request */
type DevelopmentRPC<T extends ValidRPCMethod, V> = {
  method: T;
  variables: V;
};

/** Helper type to construct an RPC response that looks like GraphQL */
type DevelopmentRPCResponse<T> = {
  error?: string;
  data: T | null;
};

export type EnqueueJobMutationRPC = DevelopmentRPC<
  "enqueueJob",
  EnqueueJobMutationVariables
>;
export type UpdateJobMutationRPC = DevelopmentRPC<
  "updateJob",
  UpdateJobMutationVariables
>;
export type DeleteJobMutationRPC = DevelopmentRPC<
  "deleteJob",
  DeleteJobMutationVariables
>;
export type GetJobQueryRPC = DevelopmentRPC<
  "getJobByName",
  GetJobByNameQueryVariables
>;

export type RPCOperation =
  | EnqueueJobMutationRPC
  | UpdateJobMutationRPC
  | DeleteJobMutationRPC
  | GetJobQueryRPC;

export type EnqueueJobMutationRPCResponse =
  DevelopmentRPCResponse<EnqueueJobMutation>;
export type UpdateJobMutationRPCResponse =
  DevelopmentRPCResponse<UpdateJobMutation>;
export type DeleteJobMutationRPCResponse =
  DevelopmentRPCResponse<DeleteJobMutation>;
export type GetJobQueryRPCResponse = DevelopmentRPCResponse<GetJobByNameQuery>;
