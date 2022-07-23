import { GraphQLClient, RequestOptions } from "@taskless/graphinql";
import type { OutgoingHttpHeaders } from "http";
import { getSdk } from "__generated__/schema";

export const getClient = (headers?: OutgoingHttpHeaders) => {
  const rel =
    typeof window === "undefined"
      ? "http://localhost:3000"
      : window.location.href;
  const url = new URL("/api/graphql", rel);
  const c = new GraphQLClient(url.toString(), {
    headers: headers as HeadersInit,
  });
  const client = getSdk<RequestOptions>(async (doc, vars) => {
    return await c.request(doc, vars);
  });
  return client;
};
