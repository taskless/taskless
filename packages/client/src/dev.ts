import {
  type Sdk,
  type JobDataFragment,
  type DeleteJobMutation,
  type DeleteJobMutationVariables,
  type EnqueueJobMutation,
  type EnqueueJobMutationVariables,
  type GetJobByNameQuery,
  type GetJobByNameQueryVariables,
  type UpdateJobMutation,
  type UpdateJobMutationVariables,
} from "./__generated__/schema.js";

/** Helper type that defines a valid RPC method */
type ValidRPCMethod = keyof Sdk;

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

type EnqueueJobMutationRPC = DevelopmentRPC<
  "enqueueJob",
  EnqueueJobMutationVariables
>;
type UpdateJobMutationRPC = DevelopmentRPC<
  "updateJob",
  UpdateJobMutationVariables
>;
type DeleteJobMutationRPC = DevelopmentRPC<
  "deleteJob",
  DeleteJobMutationVariables
>;
type GetJobQueryRPC = DevelopmentRPC<
  "getJobByName",
  GetJobByNameQueryVariables
>;

type RPCOperation =
  | EnqueueJobMutationRPC
  | UpdateJobMutationRPC
  | DeleteJobMutationRPC
  | GetJobQueryRPC;

type EnqueueJobMutationRPCResponse = DevelopmentRPCResponse<EnqueueJobMutation>;
type UpdateJobMutationRPCResponse = DevelopmentRPCResponse<UpdateJobMutation>;
type DeleteJobMutationRPCResponse = DevelopmentRPCResponse<DeleteJobMutation>;
type GetJobQueryRPCResponse = DevelopmentRPCResponse<GetJobByNameQuery>;

export type DEV = {
  JobDataFragment: JobDataFragment;
  ValidRPCMethod: ValidRPCMethod;
  RPCOperation: RPCOperation;
  RPCMethods: {
    Enqueue: {
      Request: EnqueueJobMutationRPC;
      Response: EnqueueJobMutationRPCResponse;
    };
    Update: {
      Request: UpdateJobMutationRPC;
      Response: UpdateJobMutationRPCResponse;
    };
    Delete: {
      Request: DeleteJobMutationRPC;
      Response: DeleteJobMutationRPCResponse;
    };
    Get: {
      Request: GetJobQueryRPC;
      Response: GetJobQueryRPCResponse;
    };
  };
};
