import {
  Guards,
  type QueueOptions,
  type FinalizedQueueOptions,
  type JobOptions,
} from "@taskless/types";

import { IS_DEVELOPMENT } from "../constants.js";

/** A set of default options for job objects */
const defaultJobOptions: JobOptions = {
  enabled: true,
  runAt: null,
  headers: {
    // actions are always json unless overridden
    "content-type": "application/json",
  },
  retries: 5,
};

/** Base configuration for development-like environments */
const developmentQueueOptions: QueueOptions = IS_DEVELOPMENT
  ? {
      baseUrl: "http://localhost:3000",
      credentials: {
        appId: "00000000-0000-0000-0000-000000000000",
        secret: "taskless.development",
      },
    }
  : {};

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

/** Resolve the options into finalized queue options, including runtime safety */
export const resolveOptions = (
  additionalOptions?: QueueOptions
): FinalizedQueueOptions => {
  /** Combined set of development and optionally env-based queue option defaults */
  const options: QueueOptions = {
    baseUrl:
      additionalOptions?.baseUrl ??
      productionQueueOptions?.baseUrl ??
      developmentQueueOptions?.baseUrl,
    credentials: {
      appId:
        additionalOptions?.credentials?.appId ??
        productionQueueOptions?.credentials?.appId ??
        developmentQueueOptions?.credentials?.appId,
      secret:
        additionalOptions?.credentials?.secret ??
        productionQueueOptions?.credentials?.secret ??
        developmentQueueOptions?.credentials?.secret,
      expiredSecrets: [
        ...(additionalOptions?.credentials?.expiredSecrets ?? []),
        ...(productionQueueOptions?.credentials?.expiredSecrets ?? []),
        ...(developmentQueueOptions?.credentials?.expiredSecrets ?? []),
      ],
    },
    encryptionKey:
      additionalOptions?.encryptionKey ??
      productionQueueOptions?.encryptionKey ??
      developmentQueueOptions?.encryptionKey,
    expiredEncryptionKeys: [
      ...(additionalOptions?.expiredEncryptionKeys ?? []),
      ...(productionQueueOptions?.expiredEncryptionKeys ?? []),
      ...(developmentQueueOptions?.expiredEncryptionKeys ?? []),
    ],
    defaultJobOptions: resolveJobOptions(
      defaultJobOptions,
      additionalOptions?.defaultJobOptions
    ),
  };

  // guard
  if (!Guards.Queue.isFinalizedQueueOptions(options)) {
    throw new Error(
      "You must either set TASKLESS_APP_ID and TASKLESS_APP_SECRET in process.env or pass these values in your queue options."
    );
  }

  return options;
};

/** Merge sets of job options together, handling undefined sets of options */
export const resolveJobOptions = (
  ...opts: (JobOptions | undefined)[]
): JobOptions => {
  let result: JobOptions = {};
  for (const opt of opts) {
    if (typeof opt === "undefined" || opt === null) {
      continue;
    }
    result = {
      ...result,
      headers: {
        ...(result.headers ?? {}),
        ...(opt.headers ?? {}),
      },
    };
  }
  return result;
};
