import {
  queueOptions,
  type ReceiveCallbacks,
  type JobHandler,
  type QueueOptions,
  type QueueMethods,
} from "../types/queue.js";
import {
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  IS_TESTING,
  TASKLESS_DEV_ENDPOINT,
  TASKLESS_ENDPOINT,
} from "../constants.js";
import { JobError } from "../error.js";
import { headersToGql } from "../graphql-helpers/headers.js";
import { GraphQLClient } from "../net/client.js";
import { decode, encode, sign, verify } from "./encoder.js";
import { asError, chunk, resolveJobOptions } from "./util.js";
import { Job, JobIdentifier, JobOptions } from "types/job.js";
import { TasklessBody } from "types/tasklessBody.js";
import {
  type CancelJobMutation,
  type CancelJobMutationVariables,
  CancelJobs,
  type CancelJobsMutation,
  type CancelJobsMutationVariables,
  EnqueueJob,
  type EnqueueJobMutation,
  type EnqueueJobMutationVariables,
  EnqueueJobs,
  type EnqueueJobsMutation,
  type EnqueueJobsMutationVariables,
  JobMethodEnum,
} from "__generated__/taskless.js";

function isDefined<T>(value: T | null | undefined): value is NonNullable<T> {
  if (value === null || value === undefined) return false;
  return true;
}

/** Get either the first object of the array or the object if not an array */
const firstOf = <T>(unk: T | T[]): T => {
  return Array.isArray(unk) ? unk[0] : unk;
};

let unsignedWarning = false;

/**
 * Describes a Taskless Queue instance
 * Taskless Queues are the objects that provide interface APIs to taskless.io via their
 * instance methods. When using an integration, this Queue object is created
 * automatically via the integration's `createQueue` method. When using the raw
 * taskless/client, a queue object can be created by calling `new Queue(...args)`
 */
export class Queue<T> implements QueueMethods<T> {
  private route: string | (() => string);
  private handler?: JobHandler<T, QueueMethods<T>>;
  private queueOptions: QueueOptions;
  private queueName: string;

  constructor(args: {
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
    handler?: JobHandler<T, QueueMethods<T>>;

    /** Options applied to the Queue globally such as custom credentials or a base URL */
    queueOptions?: QueueOptions;
  }) {
    this.queueOptions = queueOptions.parse(args.queueOptions ?? {});
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
    // check for versioning
    if (!("v" in body) || body.v !== 1) {
      throw new Error("Unsupported Taskless Envelope");
    }

    let checked = false;
    let ver = false;
    let payload: P | undefined;

    // if text & transport info are in the body, check signature
    // and e2e decrypt the result
    if (
      "text" in body &&
      "transport" in body &&
      typeof body.text !== "undefined" &&
      typeof body.transport !== "undefined"
    ) {
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

    // non-verified and unsigned payloads need to be checked if they're allowed
    if (!ver && !options?.allowUnsigned) {
      // warn in test/dev, throw in production
      if (IS_DEVELOPMENT || IS_TESTING) {
        // only warn once
        if (!unsignedWarning) {
          unsignedWarning = true;
          console.warn(
            "Signature mismatch or no signature available. This can happen if you've enqueued a job with one secret, but dequeued the job with another. In production, this will throw an error."
          );
        }
      } else {
        throw new Error("Signature mismatch");
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

  // defined on implementing type
  async receive(functions: ReceiveCallbacks) {
    // CJS export compatibility for ESM-only import
    const { serializeError } = await import("serialize-error");

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
        name: firstOf(h["x-taskless-queue"]) ?? null,
        projectId: firstOf(h["x-taskless-id"]) ?? null,
        verified,
        queue: this,
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

  // defined on implementing type
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
      EnqueueJobMutation,
      EnqueueJobMutationVariables
    >(EnqueueJob, {
      name: resolvedName,
      job: {
        endpoint: this.resolveRoute(),
        method: JobMethodEnum.Post,
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
   * Enqueue a set of items via a batch API call in chunks up to 100 in size
   * accessed via client.bulk.enqueue
   */
  protected async bulkEnqueue(
    jobs: { name: JobIdentifier; payload: T; options?: JobOptions }[]
  ): Promise<[Job<T>[], Error[]]> {
    const client = this.getClient();

    const collection = jobs.map((j) => {
      const opts = resolveJobOptions(
        {
          headers: {
            // actions are always json unless overridden
            "content-type": "application/json",
          },
        },
        this.queueOptions.defaultJobOptions,
        j.options
      );
      const body = this.presetWrap(j.payload);
      const resolvedName = this.packName(j.name);

      let runAt: string | undefined = new Date().toISOString();
      if (opts.runAt instanceof Date) {
        runAt = opts.runAt.toISOString();
      } else if (typeof opts.runAt === "string") {
        runAt = opts.runAt;
      } else if (typeof opts.runAt === "undefined") {
        runAt = undefined;
      }

      return {
        name: resolvedName,
        job: {
          endpoint: this.resolveRoute(),
          method: JobMethodEnum.Post,
          headers: headersToGql(opts.headers),
          body: JSON.stringify(body),
          retries: opts.retries === 0 ? 0 : opts.retries ?? 0,
          runAt,
          runEvery: opts.runEvery === null ? null : opts.runEvery ?? undefined,
          timezone: opts.timezone === null ? null : opts.timezone ?? undefined,
        },
      };
    });

    const settled = await Promise.allSettled(
      chunk(collection, 100).map((c) =>
        client.request<EnqueueJobsMutation, EnqueueJobsMutationVariables>(
          EnqueueJobs,
          {
            jobs: c,
          }
        )
      )
    );

    const resolved: Job<T>[] = [];
    const errors = [];

    // unzip
    for (const s of settled) {
      if (s.status === "rejected") {
        errors.push(asError(s.reason));
        continue;
      }
      resolved.push(
        ...(s.value.enqueueJobs ?? []).map((j) => {
          const resolvedBody = JSON.parse(j.body ?? "") as TasklessBody;
          return {
            name: j.name,
            endpoint: j.endpoint,
            enabled: j.enabled === false ? false : true,
            headers: JSON.parse(j.headers),
            payload: this.presetUnwrap(resolvedBody).payload,
            retries: j.retries,
            runAt: j.runAt ? new Date(j.runAt) : undefined,
            runEvery: j.runEvery ?? null,
            timezone: j.timezone ?? null,
          };
        })
      );
    }

    return [resolved, errors];
  }

  // defined on implementing type
  async cancel(name: JobIdentifier): Promise<Job<T> | null> {
    const client = this.getClient();
    const resolvedName = this.packName(name);

    const job = await client.request<
      CancelJobMutation,
      CancelJobMutationVariables
    >(CancelJobs, {
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

  protected async bulkCancel(
    names: JobIdentifier[]
  ): Promise<[Job<T>[], Error[]]> {
    const client = this.getClient();
    const resolvedNames = names.map((n) => this.packName(n));

    const settled = await Promise.allSettled(
      chunk(resolvedNames, 100).map((c) =>
        client.request<CancelJobsMutation, CancelJobsMutationVariables>(
          CancelJobs,
          {
            names: c,
          }
        )
      )
    );

    const resolved: Job<T>[] = [];
    const errors = [];

    // unzip
    for (const s of settled) {
      if (s.status === "rejected") {
        errors.push(asError(s.reason));
        continue;
      }
      resolved.push(
        ...(s.value.cancelJobs ?? [])
          .map((j) => {
            if (j === null) {
              return null;
            }
            const resolvedBody = JSON.parse(j.body ?? "") as TasklessBody;
            return {
              name: j.name,
              endpoint: j.endpoint,
              enabled: j.enabled === false ? false : true,
              headers: JSON.parse(j.headers),
              payload: this.presetUnwrap(resolvedBody).payload,
              retries: j.retries,
              runAt: j.runAt ? new Date(j.runAt) : undefined,
              runEvery: j.runEvery ?? null,
              timezone: j.timezone ?? null,
            };
          })
          .filter(isDefined)
      );
    }

    return [resolved, errors];
  }

  // bulk interface on instance
  bulk = {
    // defined on implementing type
    enqueue: async (
      jobs: { name: JobIdentifier; payload: T; options?: JobOptions }[]
    ) => this.bulkEnqueue(jobs),
    // defined on implementing type
    cancel: (names: JobIdentifier[]) => this.bulkCancel(names),
  };
}
