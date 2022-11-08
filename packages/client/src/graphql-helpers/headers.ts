import { type JobHeaders } from "../types/job.js";
import { type MutationEnqueueJobArgs } from "__generated__/taskless.js";

// convert & extract headers from graphql schema
type EnqueueJobInputHeadersType = Required<
  MutationEnqueueJobArgs["job"]["headers"]
>;

/** Convert optional headers into a GraphQL friendly header input */
export const headersToGql = (
  h?: JobHeaders
): EnqueueJobInputHeadersType | undefined => {
  if (!h || typeof h === "undefined") {
    return undefined;
  }

  const headers = Object.getOwnPropertyNames(h);
  return headers.map((header) => {
    const value = h[header];
    const valueAsString =
      typeof value === "string"
        ? value
        : typeof value === "number"
        ? `${value}`
        : "";
    return {
      name: `${header}`,
      value: `${valueAsString}`,
    };
  });
};
