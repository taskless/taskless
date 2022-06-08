import { JobHeaders } from "@taskless/types";

type GQLHeaders =
  | {
      name: string;
      value: string;
    }[]
  | null;

export const gqlHeadersToObject = (gqlHeaders?: GQLHeaders): JobHeaders => {
  if (typeof gqlHeaders === "undefined" || gqlHeaders === null) {
    return {};
  }
  const all: JobHeaders = {};
  for (const h of gqlHeaders) {
    all[h.name] = h.value;
  }
  return all;
};
