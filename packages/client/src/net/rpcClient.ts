import type {
  DeleteJobMutation,
  EnqueueJobMutation,
  GetJobByNameQuery,
  UpdateJobMutation,
} from "../__generated__/schema.js";
import type { GraphQLResponse, RequesterOptions } from "./netTypes.js";

import phin from "phin";
import pRetry from "p-retry";

import { create as createGraphql } from "./graphqlClient.js";
import { RequestError } from "./netTypes.js";

/**
 * Creates a lightweight RPC client mirroring GraphQL functions
 * Under the hood, this uses phin and enforces methods via the typed
 * graphql codegen output for type safety
 * @param options A set of request options
 * @param phinOptions A set of options to pass to phin
 * @returns A fully-typed GraphQL client
 */
export const create = (
  options: RequesterOptions,
  phinOptions?: phin.IJSONResponseOptions
): ReturnType<typeof createGraphql> => {
  const headers = {
    ...(options?.headers ?? {}),
    ...(phinOptions?.headers ?? {}),
    "user-agent": "Taskless Client",
    "x-taskless-app-id": options.appId,
    "x-taskless-secret": options.secret,
    "content-type": "application/json",
  };
  const send = async <R>(method: string, variables: unknown): Promise<R> => {
    try {
      const result = await pRetry(
        () =>
          phin<GraphQLResponse>({
            ...phinOptions,
            url: options.url,
            method: "POST",
            headers,
            data: JSON.stringify({
              method,
              variables,
            }),
            parse: "json",
          }),
        {
          retries: options?.retries ?? 5,
        }
      );
      if (result.body.errors) {
        throw new RequestError("Unable to run operation", result.body);
      }
      if (!result.body.data) {
        throw new RequestError("Received malformed data", result.body);
      }

      return result.body.data as R;
    } catch (err: unknown) {
      console.warn(err);
      throw new Error(
        "Could not make request: " + (typeof err === "string" ? err : "unknown")
      );
    }
  };

  return {
    async enqueueJob(variables) {
      return send<EnqueueJobMutation>("enqueueJob", variables);
    },
    async updateJob(variables) {
      return send<UpdateJobMutation>("updateJob", variables);
    },
    async deleteJob(variables) {
      return send<DeleteJobMutation>("deleteJob", variables);
    },
    async getJobByName(variables) {
      return send<GetJobByNameQuery>("getJobByName", variables);
    },
  };
};
