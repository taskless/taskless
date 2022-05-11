import { JobHeaders } from "../types.js";
import { HeaderInputType } from "../__generated__/schema.js";

type KeyOf<T> = keyof T;

/** Convert optional headers into a GraphQL friendly header input */
export const headersToGql = (h?: JobHeaders): HeaderInputType[] | undefined => {
  // graphql friendly headers input
  return h
    ? Object.keys(h).map((header: KeyOf<typeof h>) => ({
        name: `${header}`,
        value: `${h?.[header]}`,
      }))
    : undefined;
};

/** Convert a GraphQL header payload into request-friendly JSON structure */
export const gqlToHeaders = (h?: HeaderInputType[] | null): JobHeaders => {
  if (!h) return {};
  return h.reduce<JobHeaders>((all, curr) => {
    all[curr.name] = curr.value;
    return all;
  }, {});
};
