import {
  parsers,
  graphql,
  type Job,
  type JobHandler,
  type JobIdentifier,
  type JobOptions,
  type QueueOptions,
  type ReceiveCallbacks,
  type TasklessBody,
} from "@taskless/types";
import {
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  TASKLESS_DEV_ENDPOINT,
  TASKLESS_ENDPOINT,
} from "../constants.js";
import { JobError } from "../error.js";
import { headersToGql } from "../graphql-helpers/headers.js";
import { GraphQLClient } from "../net/graphql-client.js";
import { decode, encode, sign, verify } from "./encoder.js";
import { resolveJobOptions } from "./util.js";
import { loadModule } from "@brillout/load-module";

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
  private queueOptions: QueueOptions;
  private queueName: string;

  constructor(args: TasklessQueueConfig<T>) {
    this.queueOptions = parsers.queueOptions.parse(args.queueOptions ?? {});
    this.queueName = args.name;
    this.route = args.route;
    this.handler = args.handler;
  }

  /** Packs a name into string format. Used to serialize array keys */
  protected packName(name: JobIdentifier): string {
    const s = this.queueOptions.separator ?? "/";
    return Array.isArray(name) ? name.join(s) : `${name}`;
  }

  /**
   * Turn a payload into a Taskless Body
   * Can be called statically to, given an encryption key and secret, convert
   * a payload of type P (usually a Record) into a fully-enveloped, optionally
   * encrypted and optionally signed payload
   */
  static wrapPayload<P>(
    payload: P,
    options?: { encryptionKey?: string | null; secret?: string | null }
  ): TasklessBody {
    const { transport, text } = encode(
      payload,
      options?.encryptionKey ?? undefined
    );
    return {
      v: 1,
      transport,
      text,
      signature: sign(text, options?.secret ?? ""),
    };
  }

  /**
   * Turn a Taskless Body into a payload-pair
   * Performs the inverse of Queue.wrapPayload, taking a Taskless envelope
   * and converting it into a Record containing verified (boolean) and the
   * original payload (P). If provided, signatures will also be checked
   */
  static unwrapPayload<P>(
    body: TasklessBody,
    options?: {
      allowUnsigned: boolean;
      secret?: string | null;
      expiredSecrets?: (string | null)[];
      encryptionKey?: string | null;
      expiredEncryptionKeys?: (string | null)[];
    }
  ): { payload: P; verified: boolean } {
    if (body.v !== 1) {
      throw new Error("Unsupported Taskless Envelope");
    }

    let checked = false;
    let ver = false;
    let payload: P | undefined;

    // verify and decode text in the body
    if ("text" in body) {
      ver = verify(
        body.text,
        [options?.secret, ...(options?.expiredSecrets ?? [])],
        body.signature
      );

      payload = decode<P>(
        body.text,
        body.transport,
        [
          options?.encryptionKey,
          ...(options?.expiredEncryptionKeys ?? []),
        ].filter((t) => t)
      );

      checked = true;
    }

    // decode json from the body as unverified data text > json
    if (!checked && "json" in body) {
      payload = body.json as unknown as P;
      ver = false;
      checked = true;
    }

    if (!checked || typeof payload === "undefined") {
      throw new TypeError("Unrecognized payload body");
    }

    if (!ver && !options?.allowUnsigned) {
      if (!IS_DEVELOPMENT) {
        throw new Error("Signature mismatch");
      } else {
        console.error(
          "Signature mismatch or no signature available. This can happen if you've enqueued a job with one secret, but dequeued the job with another. In production, this will throw an error."
        );
      }
    }

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
      endpoint =
        process.env.TASKLESS_ENDPOINT ??
        process.env.TASKLESS_DEV_ENDPOINT ??
        TASKLESS_DEV_ENDPOINT;
    } else if (IS_PRODUCTION) {
      endpoint = process.env.TASKLESS_ENDPOINT ?? TASKLESS_ENDPOINT;
    }

    if (typeof creds !== "undefined" && "projectId" in creds) {
      return new GraphQLClient(endpoint, {
        projectId: creds.projectId ?? undefined,
        queueName: this.queueName,
        secret: creds.secret ?? undefined,
      });
    }

    if (typeof creds !== "undefined" && "appId" in creds) {
      return new GraphQLClient(endpoint, {
        appId: creds.appId ?? undefined,
        queueName: this.queueName,
        secret: creds.secret ?? undefined,
      });
    }

    return new GraphQLClient(endpoint, {
      projectId: undefined,
      queueName: this.queueName,
      secret: undefined,
    });
  }

  /** Call Queue.unwrapPayload with defaults set */
  protected presetUnwrap(body: TasklessBody) {
    return Queue.unwrapPayload<T>(body, {
      allowUnsigned:
        this.queueOptions.__dangerouslyAllowUnverifiedSignatures?.allowed ??
        false,
      encryptionKey: this.queueOptions.encryptionKey,
      expiredEncryptionKeys: this.queueOptions.expiredEncryptionKeys,
      secret: this.queueOptions.credentials?.secret,
      expiredSecrets: this.queueOptions.credentials?.expiredSecrets,
    });
  }

  /** Call Queue.wrapPayload with defaults set */
  protected presetWrap(payload: T) {
    return Queue.wrapPayload(payload, {
      encryptionKey: this.queueOptions.encryptionKey,
      secret: this.queueOptions.credentials?.secret,
    });
  }

  /**
   * Recieve a message and execute the handler for it
   * errors are caught and converted to a 500 response, while
   * any success is returned as a 200
   * @param functions A set of accessory functions for accessing the request and dispatching a response
   */
  async receive(functions: ReceiveCallbacks) {
    // async import for CJS compatibility
    const { serializeError } = (await loadModule(
      "serialize-error"
    )) as typeof import("serialize-error");

    const { getBody, getHeaders, send, sendError } = functions;

    // skip missing handler (enqueue-only)
    if (typeof this.handler === "undefined") {
      await sendError(500, {}, "This Queue was not configured with a handler");
      return;
    }

    const body = await Promise.resolve(getBody());
    const { payload, verified } = this.presetUnwrap(body);
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
      {
        headers: {
          // actions are always json unless overridden
          "content-type": "application/json",
        },
      },
      this.queueOptions.defaultJobOptions,
      options
    );
    const client = this.getClient();
    const body = this.presetWrap(payload);
    const resolvedName = this.packName(name);

    let runAt: string | undefined = new Date().toISOString();
    if (opts.runAt instanceof Date) {
      runAt = opts.runAt.toISOString();
    } else if (typeof opts.runAt === "string") {
      runAt = opts.runAt;
    } else if (typeof opts.runAt === "undefined") {
      runAt = undefined;
    }

    const job = await client.request<
      graphql.EnqueueJobMutation,
      graphql.EnqueueJobMutationVariables
    >(graphql.EnqueueJob, {
      name: resolvedName,
      job: {
        endpoint: this.resolveRoute(),
        method: graphql.JobMethodEnum.Post,
        headers: headersToGql(opts.headers),
        body: JSON.stringify(body),
        retries: opts.retries === 0 ? 0 : opts.retries ?? 0,
        runAt,
        runEvery: opts.runEvery === null ? null : opts.runEvery ?? undefined,
        timezone: opts.timezone === null ? null : opts.timezone ?? undefined,
      },
    });

    // populate result
    const resolvedBody = JSON.parse(job.enqueueJob.body ?? "") as TasklessBody;
    return {
      name: job.enqueueJob.name,
      endpoint: job.enqueueJob.endpoint,
      enabled: job.enqueueJob.enabled === false ? false : true,
      headers: opts.headers,
      payload: this.presetUnwrap(resolvedBody).payload,
      retries: job.enqueueJob.retries,
      runAt: job.enqueueJob.runAt ? new Date(job.enqueueJob.runAt) : undefined,
      runEvery: job.enqueueJob.runEvery ?? null,
      timezone: job.enqueueJob.timezone ?? null,
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

    const job = await client.request<
      graphql.CancelJobMutation,
      graphql.CancelJobMutationVariables
    >(graphql.CancelJob, {
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
      payload: this.presetUnwrap(resolvedBody).payload,
      retries: job.cancelJob.retries,
      runAt: job.cancelJob.runAt ? new Date(job.cancelJob.runAt) : undefined,
      runEvery: job.cancelJob.runEvery ?? null,
    };
  }
}
