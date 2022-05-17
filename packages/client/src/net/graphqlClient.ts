import type { GraphQLResponse, RequesterOptions } from "./netTypes.js";
import type { Requester } from "../__generated__/schema.js";

import pRetry from "p-retry";
import phin from "phin";

import { getSdk } from "../__generated__/schema.js";
import { RequestError } from "./netTypes.js";

/** A simplified GraphQL: request */
type QueryBody<V> = {
  query: string;
  variables: V;
  operationName?: string;
};

/** A factory for creating getter objects */
const createGetter = (
  globalOptions: RequesterOptions,
  phinOptions?: phin.IJSONResponseOptions
) => {
  const { url, appId, secret, retries } = globalOptions;
  if (!url) {
    throw new Error("URL was not provided when creating the client");
  }
  if (!appId) {
    throw new Error("API Key was not provided when creating the client");
  }
  if (!secret) {
    throw new Error("API Secret was not provided when creating the client");
  }

  /** A graphql-code-generator friendly fetch function */
  const get: Requester = async <R, V>(
    doc: string,
    vars: V
    // options?: object
  ): Promise<R> => {
    const headers = {
      ...(globalOptions?.headers ?? {}),
      ...(phinOptions?.headers ?? {}),
      "user-agent": "Taskless Client",
      "x-taskless-app-id": appId,
      "x-taskless-secret": secret,
      "content-type": "application/json",
    };

    const body: QueryBody<V> = {
      query: doc,
      variables: vars,
    };

    try {
      const result = await pRetry(
        () =>
          phin<GraphQLResponse>({
            ...phinOptions,
            url: globalOptions.url,
            method: "POST",
            headers,
            data: JSON.stringify(body),
            parse: "json",
          }),
        {
          retries: retries ?? 5,
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
  return get;
};

/**
 * Creates a lightweight GraphQL client based on string documents
 * Under the hood, this uses phin + typed graphql codegen for type safety
 * @param options A set of request options
 * @param phinOptions A set of options to pass to phin
 * @returns A fully-typed GraphQL client
 */
export const create = (
  options: RequesterOptions,
  phinOptions?: phin.IJSONResponseOptions
) => {
  return getSdk(createGetter(options, phinOptions));
};
