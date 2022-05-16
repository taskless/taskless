import { OutgoingHttpHeaders } from "node:http";
import { HeaderInputType } from "../__generated__/schema.js";

/** Convert optional headers into a GraphQL friendly header input */
export const headersToGql = (
  h?: OutgoingHttpHeaders
): HeaderInputType[] | undefined => {
  // graphql friendly headers input
  return h
    ? Object.keys(h).map((header: keyof typeof h) => {
        return {
          name: `${header}`,
          value: `${(h[header] ?? "").toString()}`,
        };
      })
    : undefined;
};

/** Convert a GraphQL header payload into request-friendly JSON structure */
export const gqlToHeaders = (
  h?: HeaderInputType[] | null
): OutgoingHttpHeaders => {
  if (!h) return {};
  return h.reduce<OutgoingHttpHeaders>((all, curr) => {
    all[curr.name] = curr.value;
    return all;
  }, {});
};
