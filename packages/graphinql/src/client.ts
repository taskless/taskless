import { ClientError, RequestError } from "./error.js";
import {
  GraphQLRequestContext,
  GraphQLResponse,
  Variables,
} from "./graphql-types.js";
import phin from "phin";
import { RequestOptions } from "./request-types.js";

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

  let result: phin.IJSONResponse<GraphQLResponse<TData>> | undefined;

  // legacy CJS dynamic import
  const pRetry =
    (await import("p-retry"))?.default ?? (await import("p-retry"));

  try {
    result = await pRetry(
      () =>
        phin<GraphQLResponse>({
          url: endpoint,
          method: "POST",
          headers: {
            ...(headers ?? {}),
            "content-type": "application/json",
          },
          data: JSON.stringify(gqlRequest),
          parse: "json",
        }),
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
    data: result.body.data,
    errors: result.body.errors,
    extensions: result.body.extensions,
    ...result.body,
  };

  if (result.body.errors) {
    throw new ClientError(gqlResponse, gqlRequest);
  }

  return result.body.data as TData;
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
