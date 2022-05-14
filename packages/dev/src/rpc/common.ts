import { OutgoingHttpHeaders } from "http";

type GQLHeaders =
  | {
      name: string;
      value: string;
    }[]
  | null;

export const gqlHeadersToObject = (
  gqlHeaders?: GQLHeaders
): OutgoingHttpHeaders => {
  if (typeof gqlHeaders === "undefined" || gqlHeaders === null) {
    return {};
  }
  const all: OutgoingHttpHeaders = {};
  for (const h of gqlHeaders) {
    all[h.name] = h.value;
  }
  return all;
};
