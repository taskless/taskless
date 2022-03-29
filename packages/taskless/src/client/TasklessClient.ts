import merge from "deepmerge";
import {
  GetBodyCallback,
  GetHeadersCallback,
  Job,
  JobHandler,
  JobMeta,
  JobOptions,
  QueueOptions,
  SendJsonCallback,
  TasklessBody,
} from "../types.js";
import { create as createGraphqlClient } from "./graphqlClient.js";
import { create as createRpcClient } from "./rpcClient.js";
import { JobMethodEnum } from "../__generated__/schema.js";
import { encode, decode, sign, verify } from "../client/encoder.js";
import {
  TASKLESS_DEVELOPMENT_ENDPOINT,
  TASKLESS_ENDPOINT,
} from "../constants.js";
import { headersToGql } from "../graphql-helpers/headers.js";
import { DateTime } from "luxon";

/**
 * Constructor arguments for the Taskless Client
 * @template T Describes the payload used in the {@link JobHandler}
 */
export type TasklessClientConstructorArgs<T> = {
  /** The route slug this client is managing */
  route: string;
  /**
   * A callback handler for processing the job
   * @template T The expected payload object
   */
  handler: JobHandler<T>;
  /** Options applied to the Queue globally */
  queueOptions?: QueueOptions;
  /** Default options applied to newly enqueued jobs */
  jobOptions?: JobOptions;
};

/** Queue options plus required values in order for the client to work properly */
type ResolvedQueueOptions = QueueOptions & {
  baseUrl: string;
  credentials: {
    appId: string;
    secret: string;
  };
};

/** A console warning if the user hasn't acknowledged unencrypted values are OK in production */
const warnUnencrypted = () => {
  if (
    process.env.TASKLESS_NO_ENCRYPTION_WARNING !== "1" &&
    process.env.NODE_ENV === "production"
  ) {
    console.warn(
      [
        "Using unencrypted values means that your job data is stored",
        "and transmitted in the clear. If this was intentional, please",
        "set TASKLESS_NO_ENCRYPTION_WARNING=1 to silence this message",
      ].join(" ")
    );
  }
};

/** Helper for missing items in the constructor */
const errorMissing = (optionName: string, envName: string) => {
  return `options.${optionName} was not defined. You must either define it when creating a Queue or set the environment value process.env.${envName}`;
};

/** A set of default options for queue objects, looking at ENV values first */
const defaultQueueOptions: QueueOptions = {
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

/** A set of default options for job objects */
const defaultJobOptions: JobOptions = {
  enabled: true,
  headers: {
    // actions are always json unless overridden
    "content-type": "application/json",
  },
  retries: 5,
};

/** Get either the first object of the array or the object if not an array */
const firstOf = <T>(unk: T | T[]) => {
  return (Array.isArray(unk) ? unk[0] : unk) as T;
};

export class TasklessClient<T> {
  private route: string;
  private handler: JobHandler<T>;
  private queueOptions: ResolvedQueueOptions;
  private jobOptions: JobOptions;

  constructor(args: TasklessClientConstructorArgs<T>) {
    const options: QueueOptions = merge.all([
      defaultQueueOptions,
      args.queueOptions ?? {},
    ]);

    if (!options.baseUrl) {
      throw new Error(errorMissing("baseUrl", "TASKLESS_BASE_URL"));
    } else if (!options.credentials || !options.credentials.appId) {
      throw new Error(errorMissing("credentials.appId", "TASKLESS_APP_ID"));
    } else if (!options.credentials.secret) {
      throw new Error(
        errorMissing("credentials.secret", "TASKLESS_APP_SECRET")
      );
    }

    if (!options.encryptionKey) {
      warnUnencrypted();
    }

    this.queueOptions = {
      ...options,
      baseUrl: options.baseUrl,
      credentials: options.credentials,
    };

    this.jobOptions = merge.all([defaultJobOptions, args.jobOptions ?? {}]);
    this.route = args.route;
    this.handler = args.handler;
  }

  /** Turn a payload into a Taskless Body */
  p2b(payload: T): TasklessBody {
    const { transport, text } = encode(
      payload,
      this.queueOptions.encryptionKey ?? undefined
    );
    return {
      v: 1,
      transport,
      text,
      signature: sign(text, this.queueOptions.credentials.secret),
    };
  }

  /** Turn a Taskless Body into a payload */
  b2p(body: TasklessBody): T {
    if (body.v !== 1) {
      throw new Error("Unsupported Taskless Envelope");
    }

    const ver = verify(
      body.text,
      [
        this.queueOptions.credentials.secret,
        ...(this.queueOptions.credentials.expiredSecrets ?? []),
      ],
      body.signature
    );
    if (!ver) {
      throw new Error("Signature mismatch");
    }

    const payload = decode<T>(
      body.text,
      body.transport,
      [
        this.queueOptions.encryptionKey,
        ...(this.queueOptions.expiredEncryptionKeys ?? []),
      ].filter((t) => t)
    );
    return payload;
  }

  /** Resolves a route to a fully qualified URL */
  protected resolveRoute() {
    return (
      this.queueOptions.baseUrl +
      (this.route.indexOf("/") === 0 ? this.route : "/" + this.route)
    );
  }

  /** Gets an instance of the GraphQL client or a simplified dev client */
  protected getGraphQLClient() {
    const endpoint = process.env.TASKLESS_ENDPOINT ?? TASKLESS_ENDPOINT;
    const creds = this.queueOptions.credentials;

    if (typeof creds?.appId === "undefined") {
      throw new Error("credentials.appId or TASKLESS_APP_ID was not set");
    }
    if (typeof creds?.secret === "undefined") {
      throw new Error("credentials.secret or TASKLESS_APP_SECRET was not set");
    }

    const c = createGraphqlClient({
      url: endpoint,
      appId: creds.appId,
      secret: creds.secret,
    });

    return c;
  }

  /** Get an RPC client that looks and acts like our GraphQL client for local development */
  protected getRPCClient() {
    const endpoint =
      process.env.TASKLESS_ENDPOINT ?? TASKLESS_DEVELOPMENT_ENDPOINT;
    const c = createRpcClient({
      url: endpoint,
      appId: "", // avoid using appId/secret in development client
      secret: "",
    });
    return c;
  }

  protected getClient() {
    return process.env.TASKLESS_DEV === "1"
      ? this.getRPCClient()
      : this.getGraphQLClient();
  }

  /**
   * Recieve a message and execute the handler for it
   * errors are caught and converted to a 500 response, while
   * any success is returned as a 200
   * @param functions A set of accessory functions for accessing the request and response
   * @param functions.getBody Gets the body of the request as a JS object
   * @param functions.getHeaders Gets the request headers as a JS object
   * @param functions.send Sends a request via ServerResponse or framework equivalent
   * @param functions.sendError Sends an error via ServerResponse or framework equivalent
   */
  async receive(functions: {
    getBody: GetBodyCallback<TasklessBody>;
    getHeaders: GetHeadersCallback;
    send: SendJsonCallback;
    sendError: SendJsonCallback;
  }) {
    const { getBody, getHeaders, send, sendError } = functions;
    const body = await getBody();
    const payload = this.b2p(body);
    const h: Awaited<ReturnType<typeof getHeaders>> = await getHeaders();

    const meta: JobMeta = {
      applicationId: firstOf(h["x-taskless-application"]) ?? null,
      organizationId: firstOf(h["x-taskless-organization"]) ?? null,
      attempt: parseInt(firstOf(h["x-taskless-attempt"]) ?? "0", 10),
    };

    try {
      const result = await this.handler(payload, meta);
      await send({
        result: JSON.parse(JSON.stringify(result)),
      });
      return;
    } catch (e) {
      console.error(e);
      const isE = e instanceof Error;
      await sendError({
        route: this.route,
        error: "Error thrown when running job",
        details: isE ? e.message : "no message",
        stack: isE ? e.stack ?? "no stack" : "no stack",
      });
    }
  }

  /**
   * Adds a job to the queue for processing
   * @param name The name of the job
   * @param payload The job's payload
   * @param options Additional job options overriding the queue's defaults
   * @returns a Promise containing the Job object enqueued
   */
  async enqueue(
    name: string,
    payload: T,
    options?: JobOptions
  ): Promise<Job<T>> {
    const opts = merge.all<JobOptions>([this.jobOptions, options ?? {}]);
    const client = this.getClient();
    const body = this.p2b(payload);

    const job = await client.enqueueJob({
      name,
      job: {
        endpoint: this.resolveRoute(),
        method: JobMethodEnum.Post,
        headers: headersToGql(opts.headers),
        enabled: opts.enabled === false ? false : true,
        body: JSON.stringify(body),
        retries: opts.retries === 0 ? 0 : opts.retries ?? 0,
        runAt:
          opts.runAt === null
            ? DateTime.now().toISO()
            : opts.runAt ?? undefined,
        runEvery: opts.runEvery ?? undefined,
      },
    });

    // populate result
    return {
      name: job.replaceJob.name,
      endpoint: job.replaceJob.endpoint,
      enabled: job.replaceJob.enabled === false ? false : true,
      headers: opts.headers,
      payload: this.b2p(JSON.parse(job.replaceJob.body ?? "")),
      retries: job.replaceJob.retries,
      runAt: job.replaceJob.runAt,
    };
  }

  /**
   * Updates a job in the queue
   * @param name The name of the job
   * @param payload The job's payload. A value of `undefined` will reuse the existing payload
   * @param options Additional job options overriding the queue's defaults
   * @returns a Promise containing the updated Job object
   */
  async update(
    name: string,
    payload: T | undefined,
    options?: JobOptions
  ): Promise<Job<T>> {
    const opts = merge.all<JobOptions>([this.jobOptions, options ?? {}]);
    const client = this.getClient();
    const body = typeof payload !== "undefined" ? this.p2b(payload) : undefined;

    const job = await client.updateJob({
      name,
      job: {
        endpoint: this.resolveRoute(),
        method: JobMethodEnum.Post,
        headers:
          typeof opts.headers !== "undefined"
            ? headersToGql(opts.headers)
            : undefined,
        enabled: opts.enabled === false ? false : opts.enabled,
        body: typeof body !== "undefined" ? JSON.stringify(body) : undefined,
        retries: opts.retries === 0 ? 0 : opts.retries,
        runAt:
          opts.runAt === null
            ? DateTime.now().toISO()
            : opts.runAt ?? undefined,
        runEvery: opts.runEvery,
      },
    });

    return {
      name: job.updateJob.name,
      endpoint: job.updateJob.endpoint,
      enabled: job.updateJob.enabled === false ? false : true,
      payload: this.b2p(JSON.parse(job.updateJob.body ?? "")),
      retries: job.updateJob.retries,
      runAt: job.updateJob.runAt,
    };
  }

  /**
   * Removes a job from the queue
   * @param name The name of the job
   * @returns a Promise containing the Job object that was removed
   */
  async delete(name: string): Promise<Job<T> | null> {
    const client = this.getClient();

    const job = await client.deleteJob({
      name,
    });

    if (!job.deleteJob) {
      return null;
    }

    return {
      name: job.deleteJob.name,
      endpoint: job.deleteJob.endpoint,
      enabled: job.deleteJob.enabled === false ? false : true,
      payload: this.b2p(JSON.parse(job.deleteJob.body ?? "")),
      retries: job.deleteJob.retries,
      runAt: job.deleteJob.runAt,
    };
  }

  async get(name: string): Promise<Job<T> | null> {
    const client = this.getClient();

    const result = await client.getJobByName({
      name,
    });

    if (!result.job) {
      return null;
    }

    return {
      name: result.job.name,
      endpoint: result.job.endpoint,
      enabled: result.job.enabled === false ? false : true,
      payload: this.b2p(JSON.parse(result.job.body ?? "")),
      retries: result.job.retries,
      runAt: result.job.runAt,
    };
  }
}
