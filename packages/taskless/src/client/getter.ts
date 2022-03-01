import { getSdk, Requester } from "../__generated__/schema";
import pRetry from "p-retry";
import phin from "phin";

/** A Phin GraphQL request error */
export class RequestError extends Error {
  raw: any;
  constructor(err: any, raw: any) {
    super(err?.message ?? err);
    this.raw = err;
  }
}

/** Options for generating a GraphQL Phin client */
type RequesterOptions = {
  /** The GraphQL endpoint URL */
  url: string;
  /** Additional headers to pass with the request */
  headers?: {
    [header: string]: string;
  };
  /** The Taskless App ID */
  appId: string;
  /** The Taskless App Secret */
  secret: string;
  /** The number of HTTP retries to make when doing GraphQL operations */
  retries?: number;
};

/** A simplified GraphQL response */
type PhinGraphQLResponse = {
  data?: any;
  errors?: any;
};

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
    vars: V,
    options?: any
  ): Promise<R> => {
    const all = Object.assign({}, phinOptions ?? {}, options ?? {});

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
          phin<PhinGraphQLResponse>({
            ...phinOptions,
            url: all.url,
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

      return result.body.data;
    } catch (err: any) {
      throw new Error("Could not make request: " + err?.message);
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
