import { GraphQLRequestContext, GraphQLResponse } from "./graphql-types.js";

export class RequestError extends Error {
  original?: Error;
}

export class ClientError extends Error {
  response: GraphQLResponse;
  request: GraphQLRequestContext;

  constructor(response: GraphQLResponse, request: GraphQLRequestContext) {
    const message = `${ClientError.extractMessage(response)}: ${JSON.stringify({
      response,
      request,
    })}`;

    super(message);

    Object.setPrototypeOf(this, ClientError.prototype);

    this.response = response;
    this.request = request;

    // this is needed as Safari doesn't support .captureStackTrace
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, ClientError);
    }
  }

  private static extractMessage(response: GraphQLResponse): string {
    try {
      return response.errors?.[0].message ?? "Unknown error";
    } catch (e) {
      return `GraphQL Error (Code: ${response.status})`;
    }
  }
}
