export const TASKLESS_ENDPOINT = "https://for.taskless.io/api/graphql" as const;
export const TASKLESS_DEV_ENDPOINT = "http://localhost:3001/api/rpc" as const;

/** Is this a production or production-like environments */
export const IS_PRODUCTION =
  process.env.NODE_ENV === "production" ||
  process.env.TASKLESS_ENV === "production";
