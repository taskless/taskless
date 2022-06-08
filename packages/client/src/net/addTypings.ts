import { RequestOptions } from "@taskless/graphinql";
import { getSdk, Requester } from "../__generated__/schema.js";
import { GraphQLClient } from "./graphql-client.js";

/** Returns a fully-typed GraphQL client */
export const addTypings = (client: GraphQLClient) => {
  const requester: Requester<RequestOptions> = async <R, V>(
    doc: string,
    vars: V
    // options?: object
  ): Promise<R> => {
    return await client.request(doc, vars);
  };
  return getSdk(requester);
};
