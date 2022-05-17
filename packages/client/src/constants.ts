export const TASKLESS_ENDPOINT = "https://for.taskless.io/api/graphql" as const;
export const TASKLESS_DEV_ENDPOINT = "http://localhost:3001/api/rpc" as const;
export const IS_PRODUCTION =
  typeof process.env.TASKLESS_ENV !== "undefined"
    ? process.env.TASKLESS_ENV === "production"
    : process.env.NODE_ENV === "production";
