import {
  GraphQLClient as CoreGraphQLClient,
  ClientError,
  RequestError,
} from "@taskless/graphinql";

/**
 * Extends the GraphinQL client to explicitly set the URL relative to the browser environment
 */
export class GraphQLClient extends CoreGraphQLClient {
  constructor() {
    if (typeof window !== "undefined") {
      super(window.location.origin + "/api/graphql");
    } else {
      throw new Error("Cannot use client in non-browser");
    }
  }
}

export const getClient = () => new GraphQLClient();

export { ClientError, RequestError };
