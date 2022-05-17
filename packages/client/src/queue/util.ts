import type { QueueOptions, FinalizedQueueOptions } from "@taskless/types";

import merge from "deepmerge";

import { IS_PRODUCTION } from "../constants.js";

/** Helper function for missing items in the environment */
export const errorMissing = (optionName: string, envName: string): string => {
  return `options.${optionName} was not defined. You must either define it when creating a Queue or set the environment value process.env.${envName}`;
};

/** Resolve the options into finalized queue options, including runtime safety */
export const resolveOptions = (
  additionalOptions?: QueueOptions
): FinalizedQueueOptions => {
  /** Base configuration for development-like environments */
  const developmentQueueOptions: QueueOptions = {
    baseUrl: "http://localhost:3000",
    credentials: {
      appId: "00000000-0000-0000-0000-000000000000",
      secret: "taskless.development",
    },
  };

  /** A set of default options for queue objects, taken from process.env */
  const productionQueueOptions: QueueOptions = {
    baseUrl: process.env.TASKLESS_BASE_URL ?? undefined,
    encryptionKey: process.env.TASKLESS_ENCRYPTION_KEY ?? undefined,
    expiredEncryptionKeys: process.env.TASKLESS_PREVIOUS_ENCRYPTION_KEYS
      ? `${process.env.TASKLESS_PREVIOUS_ENCRYPTION_KEYS}`
          .split(",")
          .map((s) => s.trim())
      : [],
    credentials:
      process.env.TASKLESS_APP_ID && process.env.TASKLESS_APP_SECRET
        ? {
            appId: process.env.TASKLESS_APP_ID,
            secret: process.env.TASKLESS_APP_SECRET,
            expiredSecrets: process.env.TASKLESS_PREVIOUS_APP_SECRETS
              ? `${process.env.TASKLESS_PREVIOUS_APP_SECRETS}`
                  .split(",")
                  .map((s) => s.trim())
              : [],
          }
        : undefined,
  };

  /** Combined set of development and optionally env-based queue option defaults */
  const options: QueueOptions = merge.all([
    IS_PRODUCTION ? {} : developmentQueueOptions,
    productionQueueOptions,
    typeof additionalOptions === "undefined" ? {} : additionalOptions,
  ]);

  if (typeof options.credentials?.appId === "undefined") {
    throw new Error(errorMissing("credentials.appId", "TASKLESS_APP_ID"));
  }
  if (typeof options.credentials?.secret === "undefined") {
    throw new Error(errorMissing("credentials.secret", "TASKLESS_APP_SECRET"));
  }

  return {
    ...options,
    credentials: {
      ...(options.credentials ?? {}),
      appId: options.credentials.appId,
      secret: options.credentials.secret,
    },
  };
};
