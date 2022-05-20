/** The default Taskless endpoint for Taskless.io */
export const TASKLESS_ENDPOINT = "https://for.taskless.io/api/graphql" as const;

/** The default Taskless Development Server endpoint */
export const TASKLESS_DEV_ENDPOINT = "http://localhost:3001/api/rpc" as const;

/** A reusable flag that determines if we are running in a production environment */
export const IS_PRODUCTION =
  typeof process.env.TASKLESS_ENV !== "undefined"
    ? process.env.TASKLESS_ENV === "production"
    : process.env.NODE_ENV === "production";
