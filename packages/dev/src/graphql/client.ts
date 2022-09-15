import { GraphQLClient as CoreGraphQLClient } from "@taskless/graphinql";

/**
 * Extends the GraphinQL client to explicitly check for an app ID and secret
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
