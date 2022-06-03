import {
  type FinalizedQueueOptions,
  type Job,
  type JobHandler,
  type JobIdentifier,
  type JobOptions,
  type QueueOptions,
  type ReceiveCallbacks,
  type TasklessBody,
} from "@taskless/types";
import { DateTime } from "luxon";
import { serializeError } from "serialize-error";

import { JobError } from "../error.js";
import { JobMethodEnum } from "../__generated__/schema.js";
import { create as createGraphqlClient } from "../net/graphqlClient.js";
import { create as createRpcClient } from "../net/rpcClient.js";
import { encode, decode, sign, verify } from "./encoder.js";
import {
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  TASKLESS_DEV_ENDPOINT,
  TASKLESS_ENDPOINT,
} from "../constants.js";
import { headersToGql } from "../graphql-helpers/headers.js";
import { resolveJobOptions, resolveOptions } from "./util.js";

/**
 * Constructor arguments for the Taskless Queue
 * @template T Describes the payload used in the {@link JobHandler}
 */
export type TasklessQueueConfig<T> = {
  /**
   * The name for the queue
   * Queues in Taskless are a search based grouping, used to quickly search for related jobs. If
   * you need to separate traffic for the purposes of rate limiting, consider using applications,
   * each which can receive its own ID and secret.
   */
  name: string;

  /**
   * The route slug this Queue is managing. Can either be a string or a function
   * that provides a string if being invoked at a later time
   */
  route: string | (() => string);

  /**
   * A callback handler for processing the job
   * @template T The expected payload object
   */
  handler?: JobHandler<T>;

  /** Options applied to the Queue globally such as custom credentials or a base URL */
  queueOptions?: QueueOptions;
};

/** Get either the first object of the array or the object if not an array */
const firstOf = <T>(unk: T | T[]): T => {
  return Array.isArray(unk) ? unk[0] : unk;
};

export class Queue<T> {
  private route: string | (() => string);
  private handler?: JobHandler<T>;
  private queueOptions: FinalizedQueueOptions;

  constructor(args: TasklessQueueConfig<T>) {
    const options = resolveOptions(args.queueOptions);

    this.queueOptions = {
      ...options,
    };

    this.route = args.route;
    this.handler = args.handler;
  }

  /** Packs a name into string format */
  packName(name: JobIdentifier): string {
    const s = this.queueOptions.separator ?? "/";
    return Array.isArray(name) ? name.join(s) : `${name}`;
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
  b2p(
    body: TasklessBody,
    allowUnsigned: boolean
  ): { payload: T; verified: boolean } {
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

    if (!ver && !allowUnsigned) {
      if (!IS_DEVELOPMENT) {
        throw new Error("Signature mismatch");
      } else {
        console.error(
          "Signature mismatch. This can happen if you've enqueued a job with one secret, but dequeued the job with another. In production, this will throw an error."
        );
      }
    }

    const payload = decode<T>(
      body.text,
      body.transport,
      [
        this.queueOptions.encryptionKey,
        ...(this.queueOptions.expiredEncryptionKeys ?? []),
      ].filter((t) => t)
    );

    return { payload, verified: ver };
  }

  /** Resolves a route to a fully qualified URL */
  protected resolveRoute() {
    const route =
      typeof this.route === "function" ? this.route() : this.route ?? "";

    // if route starts with https?://, it's valid already
    if (route.indexOf("http://") === 0 || route.indexOf("https://") === 0) {
      return route;
    }

    return `${this.queueOptions.baseUrl ?? ""}${
      route.indexOf("/") === 0 ? route : "/" + route
    }`;
  }

  /** Gets an instance of the GraphQL client or a simplified dev client */
  protected getGraphQLClient() {
    const endpoint = TASKLESS_ENDPOINT;
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
    const endpoint = process.env.TASKLESS_DEV_ENDPOINT ?? TASKLESS_DEV_ENDPOINT;
    const c = createRpcClient({
      url: endpoint,
      appId: "", // avoid using appId/secret in development client
      secret: "",
    });
    return c;
  }

  protected getClient() {
    if (IS_DEVELOPMENT) {
      return this.getRPCClient();
    } else if (IS_PRODUCTION) {
      return this.getGraphQLClient();
    }

    return this.getGraphQLClient();
  }

  /**
   * Recieve a message and execute the handler for it
   * errors are caught and converted to a 500 response, while
   * any success is returned as a 200
   * @param functions A set of accessory functions for accessing the request and dispatching a response
   */
  async receive(functions: ReceiveCallbacks) {
    const { getBody, getHeaders, send, sendError } = functions;

    // skip missing handler (enqueue-only)
    if (typeof this.handler === "undefined") {
      await sendError(500, {}, "This Queue was not configured with a handler");
      return;
    }

    const body = await Promise.resolve(getBody());
    const { payload, verified } = this.b2p(
      body,
      this.queueOptions.__dangerouslyAllowUnverifiedSignatures?.allowed ?? false
    );
    const h: Awaited<ReturnType<typeof getHeaders>> = await getHeaders();

    try {
      const result = await this.handler(payload, {
        applicationId: firstOf(h["x-taskless-application"]) ?? null,
        organizationId: firstOf(h["x-taskless-organization"]) ?? null,
        attempt: parseInt(firstOf(h["x-taskless-attempt"]) ?? "0", 10),
        verified,
      });
      await send(JSON.parse(JSON.stringify(result ?? {})));
      return;
    } catch (e) {
      console.error(e);
      const ser = serializeError(e);
      if (e instanceof JobError) {
        await sendError(e.statusCode, e.headers, ser);
      } else {
        await sendError(500, {}, ser);
      }
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
    name: JobIdentifier,
    payload: T,
    options?: JobOptions
  ): Promise<Job<T>> {
    const opts = resolveJobOptions(
      this.queueOptions.defaultJobOptions,
      options
    );
    const client = this.getClient();
    const body = this.p2b(payload);
    const resolvedName = this.packName(name);

    const job = await client.enqueueJob({
      name: resolvedName,
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
        runEvery: opts.runEvery === null ? null : opts.runEvery ?? undefined,
      },
    });

    // populate result
    const resolvedBody = JSON.parse(job.replaceJob.body ?? "") as TasklessBody;
    return {
      name: job.replaceJob.name,
      endpoint: job.replaceJob.endpoint,
      enabled: job.replaceJob.enabled === false ? false : true,
      headers: opts.headers,
      payload: this.b2p(
        resolvedBody,
        this.queueOptions.__dangerouslyAllowUnverifiedSignatures?.allowed ??
          false
      ).payload,
      retries: job.replaceJob.retries,
      runAt: job.replaceJob.runAt,
      runEvery: job.replaceJob.runEvery ?? null,
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
    name: JobIdentifier,
    payload: T | undefined,
    options?: JobOptions
  ): Promise<Job<T>> {
    const opts = resolveJobOptions(
      this.queueOptions.defaultJobOptions,
      options
    );
    const client = this.getClient();
    const body = typeof payload !== "undefined" ? this.p2b(payload) : undefined;
    const resolvedName = this.packName(name);

    const job = await client.updateJob({
      name: resolvedName,
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

    // result
    const resolvedBody = JSON.parse(job.updateJob.body ?? "") as TasklessBody;
    return {
      name: job.updateJob.name,
      endpoint: job.updateJob.endpoint,
      enabled: job.updateJob.enabled === false ? false : true,
      payload: this.b2p(
        resolvedBody,
        this.queueOptions.__dangerouslyAllowUnverifiedSignatures?.allowed ??
          false
      ).payload,
      retries: job.updateJob.retries,
      runAt: job.updateJob.runAt,
      runEvery: job.updateJob.runEvery ?? null,
    };
  }

  /**
   * Removes a job from the queue
   * @param name The name of the job
   * @returns a Promise containing the Job object that was removed
   */
  async delete(name: JobIdentifier): Promise<Job<T> | null> {
    const client = this.getClient();
    const resolvedName = this.packName(name);

    const job = await client.deleteJob({
      name: resolvedName,
    });

    if (!job.deleteJob) {
      return null;
    }

    // result
    const resolvedBody = JSON.parse(job.deleteJob.body ?? "") as TasklessBody;
    return {
      name: job.deleteJob.name,
      endpoint: job.deleteJob.endpoint,
      enabled: job.deleteJob.enabled === false ? false : true,
      payload: this.b2p(
        resolvedBody,
        this.queueOptions.__dangerouslyAllowUnverifiedSignatures?.allowed ??
          false
      ).payload,
      retries: job.deleteJob.retries,
      runAt: job.deleteJob.runAt,
      runEvery: job.deleteJob.runEvery ?? null,
    };
  }

  async get(name: JobIdentifier): Promise<Job<T> | null> {
    const client = this.getClient();
    const resolvedName = this.packName(name);

    const result = await client.getJobByName({
      name: resolvedName,
    });

    if (!result.job) {
      return null;
    }

    // result
    const resolvedBody = JSON.parse(result.job.body ?? "") as TasklessBody;
    return {
      name: result.job.name,
      endpoint: result.job.endpoint,
      enabled: result.job.enabled === false ? false : true,
      payload: this.b2p(
        resolvedBody,
        this.queueOptions.__dangerouslyAllowUnverifiedSignatures?.allowed ??
          false
      ).payload,
      retries: result.job.retries,
      runAt: result.job.runAt,
      runEvery: result.job.runEvery ?? null,
    };
  }
}
