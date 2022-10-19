import { ClientError, RequestError } from "./error.js";
import {
  GraphQLRequestContext,
  GraphQLResponse,
  Variables,
} from "./graphql-types.js";
import { RequestOptions } from "./request-types.js";
import fetch from "cross-fetch";

export async function request<TData, V extends Variables>(
  endpoint: string | URL,
  query: string,
  variables?: V,
  options?: RequestOptions
) {
  const { headers, retries } = options ?? {};

  const gqlRequest: GraphQLRequestContext<V> = {
    query,
    variables: variables ?? ({} as V), // hard-cast
  };

  let result: GraphQLResponse<TData> | undefined;

  const { default: pRetry } = await import("p-retry");

  try {
    result = await pRetry(
      async () => {
        const r = await fetch(endpoint, {
          method: "POST",
          headers: {
            ...(headers ?? {}),
            "content-type": "application/json",
          },
          body: JSON.stringify(gqlRequest),
        });
        const j = (await r.json()) as GraphQLResponse<TData>;
        return j;
      },

      {
        retries: typeof retries === "number" ? retries : 5,
      }
    );
  } catch (e) {
    // the network request itself failed
    const err = new RequestError("Unable to make the request");
    err.original = e as Error;
    throw err;
  }

  if (typeof result === "undefined") {
    throw new RequestError("Unable to parse the response");
  }

  const gqlResponse: GraphQLResponse<TData> = {
    data: result.data,
    errors: result.errors,
    extensions: result.extensions,
    ...result,
  };

  if (result.errors) {
    throw new ClientError(gqlResponse, gqlRequest);
  }

  return result.data as TData;
}

export class GraphQLClient {
  private endpoint: string | URL;
  private options: RequestOptions;

  constructor(endpoint: string | URL, options?: RequestOptions) {
    this.endpoint = endpoint;
    this.options = {
      retries: typeof options?.retries === "number" ? options.retries : 5,
      headers: options?.headers ?? {},
    };
  }

  request<TData = unknown, V extends Variables = Variables>(
    query: string,
    variables?: V,
    options?: RequestOptions
  ) {
    const mergedOptions: RequestOptions = {
      retries:
        typeof options?.retries === "number"
          ? options.retries
          : this.options.retries,
      headers: {
        ...(this.options.headers ?? {}),
        ...(options?.headers ?? {}),
      },
    };
    return request<TData, V>(this.endpoint, query, variables, mergedOptions);
  }
}
