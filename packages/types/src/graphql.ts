import { z } from "zod";

/** Describes the array of headers */
const headers = z.array(
  z.object({
    name: z.string(),
    value: z.string(),
  })
);

export type EnqueueJobInputHeadersType = z.infer<typeof headers>;

/** An enum of possible request types */
const methodEnum = z.enum(["GET", "POST"]);

/** Describe the job returned from any operation */
const job = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  endpoint: z.string(),
  headers: headers.nullish(),
  body: z.string().nullish(),
  retries: z.number(),
  runAt: z.string(),
  runEvery: z.string().nullish(),
  timezone: z.string().nullish(),
});

/** GraphQL string for making the request */
export const enqueueJobMutationDocument = /* GraphQL */ `
  mutation enqueueJob($name: String!, $job: EnqueueJobInputType!) {
    enqueueJob(name: $name, job: $job) {
      id
      name
      enabled
      endpoint
      headers
      body
      retries
      runAt
      runEvery
      timezone
    }
  }
`;

/** Arguments for making the enqueueJobMutation request */
export const enqueueJobMutationArguments = z.object({
  name: z.string(),
  job: z.object({
    enabled: z.boolean().nullish(),
    endpoint: z.string(),
    body: z.string().nullish(),
    headers: headers.nullish(),
    method: methodEnum.optional(),
    retries: z.number().optional(),
    runAt: z.string().optional(),
    runEvery: z.string().nullish(),
    timezone: z.string().nullish(),
  }),
});

/** The result of enqueueJobMutation */
export const enqueueJobMutationResult = z.object({
  enqueueJob: job,
});

/** Describes the arguments for the GraphQL request */
export type EnqueueJobMutationArguments = z.infer<
  typeof enqueueJobMutationArguments
>;

/** Describes the resulting GraphQL document */
export type EnqueueJobMutation = z.infer<typeof enqueueJobMutationResult>;

/** GraphQL string for making the request */
export const cancelJobMutationDocument = /* GraphQL */ `
  mutation cancelJob($name: String!) {
    cancelJob(name: $name) {
      id
      name
      enabled
      endpoint
      headers
      body
      retries
      runAt
      runEvery
      timezone
    }
  }
`;

/** Arguments for making the cancelJobMutation request */
export const cancelJobMutationArguments = z.object({
  name: z.string(),
});

/** The result of cancelJobMutation */
export const cancelJobMutationResult = z.object({
  cancelJob: z.union([job, z.null()]),
});

/** Describes the arguments for the GraphQL request */
export type CancelJobMutationArguments = z.infer<
  typeof cancelJobMutationArguments
>;

/** Describes the resulting GraphQL document */
export type CancelJobMutation = z.infer<typeof cancelJobMutationResult>;
