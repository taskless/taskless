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

import {
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  TASKLESS_DEV_ENDPOINT,
  TASKLESS_ENDPOINT,
} from "../constants.js";
import { JobError } from "../error.js";
import { headersToGql } from "../graphql-helpers/headers.js";
import { addTypings } from "../net/addTypings.js";
import { GraphQLClient } from "../net/graphql-client.js";
import { JobMethodEnum } from "../__generated__/schema.js";
import { decode, encode, sign, verify } from "./encoder.js";
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
  private queueName: string;

  constructor(args: TasklessQueueConfig<T>) {
    const options = resolveOptions(args.queueOptions);

    this.queueOptions = {
      ...options,
    };

    this.queueName = args.name;
    this.route = args.route;
    this.handler = args.handler;
  }

  /** Packs a name into string format. Used to serialize array keys */
  protected packName(name: JobIdentifier): string {
    const s = this.queueOptions.separator ?? "/";
    return Array.isArray(name) ? name.join(s) : `${name}`;
  }

  /** Turn a payload into a Taskless Body */
  protected wrapPayload(payload: T): TasklessBody {
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
  protected unwrapPayload(
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

  /**
   * Get a graphql client for the appropriat environment
   * Checks secrets and sets the correct endpoint
   */
  protected getClient() {
    const creds = this.queueOptions.credentials;
    let endpoint: string = TASKLESS_ENDPOINT;
    if (IS_DEVELOPMENT) {
      endpoint = process.env.TASKLESS_DEV_ENDPOINT ?? TASKLESS_DEV_ENDPOINT;
    } else if (IS_PRODUCTION) {
      endpoint = process.env.TASKLESS_ENDPOINT ?? TASKLESS_ENDPOINT;
    }

    const client = new GraphQLClient(endpoint, {
      appId: creds.appId,
      projectId: creds.projectId,
      queueName: this.queueName,
      secret: creds.secret,
    });

    return addTypings(client);
  }

  /**
   * Recieve a message and execute the handler for it
   * errors are caught and converted to a 500 response, while
   * any success is returned as a 200
   * @param functions A set of accessory functions for accessing the request and dispatching a response
   */
  async receive(functions: ReceiveCallbacks) {
    const _serializeError = await import("serialize-error");
    const serializeError = _serializeError.serializeError;

    const { getBody, getHeaders, send, sendError } = functions;

    // skip missing handler (enqueue-only)
    if (typeof this.handler === "undefined") {
      await sendError(500, {}, "This Queue was not configured with a handler");
      return;
    }

    const body = await Promise.resolve(getBody());
    const { payload, verified } = this.unwrapPayload(
      body,
      this.queueOptions.__dangerouslyAllowUnverifiedSignatures?.allowed ?? false
    );
    const h: Awaited<ReturnType<typeof getHeaders>> = await getHeaders();

    try {
      const result = await this.handler(payload, {
        queue: firstOf(h["x-taskless-queue"]) ?? null,
        projectId: firstOf(h["x-taskless-id"]) ?? null,
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
   * Adds an item to the queue. If an item of the same name exists, it will be
   * replaced with this new data. If a job was already scheduled with this
   * `name` property, then its information will be updated to the
   * new provided values. You should always call `enqueue()` as if you are
   * calling it for the first time.
   * ([docs](https://taskless.io/docs/packages/client#enqueue))
   * @param name The Job's identifiable name. If an array is provided, all values will be concatenated with {@link QueueOptions.separator}, which is `-` by default
   * @param payload The Job's payload to be delivered
   * @param options Job options. These overwrite the default job options specified on the queue at creation time
   * @throws Error when the job could not be created in the Taskless system
   * @returns The `Job` object
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
    const body = this.wrapPayload(payload);
    const resolvedName = this.packName(name);

    const job = await client.enqueueJob({
      name: resolvedName,
      job: {
        endpoint: this.resolveRoute(),
        method: JobMethodEnum.Post,
        headers: headersToGql(opts.headers),
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
    const resolvedBody = JSON.parse(job.enqueueJob.body ?? "") as TasklessBody;
    return {
      name: job.enqueueJob.name,
      endpoint: job.enqueueJob.endpoint,
      enabled: job.enqueueJob.enabled === false ? false : true,
      headers: opts.headers,
      payload: this.unwrapPayload(
        resolvedBody,
        this.queueOptions.__dangerouslyAllowUnverifiedSignatures?.allowed ??
          false
      ).payload,
      retries: job.enqueueJob.retries,
      runAt: job.enqueueJob.runAt,
      runEvery: job.enqueueJob.runEvery ?? null,
    };
  }

  /**
   * Cancels any scheduled work for this item in the queue. Any jobs in
   * process are allowed to complete. If a job has recurrence, future jobs
   * will be cancelled.
   * ([docs](https://taskless.io/docs/packages/client#cancel))
   * @param name The Job's identifiable name. If an array is provided, all values will be concatenated with {@link QueueOptions.separator}, which is `-` by default
   * @throws Error if the job could not be cancelled
   * @returns The cancelled `Job` object, or `null` if no job was found with `name`
   */
  async cancel(name: JobIdentifier): Promise<Job<T> | null> {
    const client = this.getClient();
    const resolvedName = this.packName(name);

    const job = await client.cancelJob({
      name: resolvedName,
    });

    if (!job.cancelJob) {
      return null;
    }

    // result
    const resolvedBody = JSON.parse(job.cancelJob.body ?? "") as TasklessBody;
    return {
      name: job.cancelJob.name,
      endpoint: job.cancelJob.endpoint,
      enabled: job.cancelJob.enabled === false ? false : true,
      payload: this.unwrapPayload(
        resolvedBody,
        this.queueOptions.__dangerouslyAllowUnverifiedSignatures?.allowed ??
          false
      ).payload,
      retries: job.cancelJob.retries,
      runAt: job.cancelJob.runAt,
      runEvery: job.cancelJob.runEvery ?? null,
    };
  }
}
