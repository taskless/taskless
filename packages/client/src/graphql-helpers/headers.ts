import { JobHeaders } from "@taskless/types";
import { HeaderInputType } from "../__generated__/schema.js";

/** Convert optional headers into a GraphQL friendly header input */
export const headersToGql = (h?: JobHeaders): HeaderInputType[] | undefined => {
  if (!h || typeof h === "undefined") {
    return undefined;
  }

  const headers = Object.getOwnPropertyNames(h);
  return headers.map((header) => {
    const value = headers[header as keyof typeof headers];
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

/** Convert a GraphQL header payload into request-friendly JSON structure */
export const gqlToHeaders = (h?: HeaderInputType[] | null): JobHeaders => {
  if (!h) return {};

  return h.reduce<JobHeaders>((all, curr) => {
    all[curr.name] = curr.value;
    return all as Record<string, string>;
  }, {});
};
