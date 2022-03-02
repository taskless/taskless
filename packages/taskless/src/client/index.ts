import merge from "deepmerge";
import { v4 } from "uuid";
import {
  GetBodyCallback,
  GetHeadersCallback,
  isTasklessBody,
  Job,
  JobHandler,
  JobHeaders,
  JobMeta,
  JobOptions,
  QueueOptions,
  SendJsonCallback,
  TasklessBody,
} from "../types";
import { create } from "./getter";
import { JobMethodEnum } from "../__generated__/schema";
import { encode, decode } from "./encoder";

/** A set of default options for queue objects, looking at ENV values first */
const defaultQueueOptions: QueueOptions = {
  baseUrl: process.env.TASKLESS_BASE_URL ?? undefined,
  encryptionKey: process.env.TASKLESS_ENCRYPTION_KEY ?? undefined,
  expiredEncryptionKeys: process.env.TASKLESS_PREVIOUS_ENCRYPTION_KEYS
    ? `${process.env.TASKLESS_PREVIOUS_ENCRYPTION_KEYS}`
        .split(",")
        .map((s) => s.trim())
    : [],
  credentials: {
    appId: process.env.TASKLESS_APP_ID ?? undefined,
    secret: process.env.TASKLESS_APP_SECRET ?? undefined,
  },
};

/** A set of default options for job objects */
const defaultJobOptions: JobOptions = {
  enabled: true,
  headers: {},
  retries: 5,
};

/** Prefers undefined, defaulting to the second argument */
const undefinedOr = <T = never>(x?: unknown, other?: T): T | undefined =>
  typeof x === "undefined" ? undefined : other;

const firstOf = <T>(unk: T | T[]) => {
  return (Array.isArray(unk) ? unk[0] : unk) as T;
};

/** A helper function for keyof typeof access */
type KeyOf<T> = keyof T;

type TasklessClientConstructorArgs<T> = {
  route: string;
  handler: JobHandler<T>;
  queueOptions?: QueueOptions;
  jobOptions?: JobOptions;
};

export class TasklessClient<T> {
  private route: string;
  private handler: JobHandler<T>;
  private queueOptions: QueueOptions;
  private jobOptions: JobOptions;

  constructor(args: TasklessClientConstructorArgs<T>) {
    this.queueOptions = merge.all([
      defaultQueueOptions,
      args.queueOptions ?? {},
    ]);
    this.jobOptions = merge.all([defaultJobOptions, args.jobOptions ?? {}]);
    this.route = args.route;
    this.handler = args.handler;
  }

  /** Convert option headers into a GraphQL friendly header input */
  headersToGql(h?: JobHeaders) {
    // graphql friendly headers input
    return h
      ? Object.keys(h).map((header: KeyOf<typeof h>) => ({
          name: `${header}`,
          value: `${h?.[header]}`,
        }))
      : undefined;
  }

  /** Resolves a route to a fully qualified URL */
  resolveRoute() {
    return (
      this.queueOptions.baseUrl +
      (this.route.indexOf("/") === 0 ? this.route : "/" + this.route)
    );
  }

  /** Gets an instance of the zeus client */
  getClient() {
    const creds = this.queueOptions.credentials;
    if (typeof creds?.appId === "undefined") {
      throw new Error("credentials.appId or TASKLESS_APP_ID was not set");
    }
    if (typeof creds?.secret === "undefined") {
      throw new Error("credentials.appId or TASKLESS_APP_ID was not set");
    }

    const endpoint =
      process.env.TASKLESS_ENDPOINT ?? "https://for.taskless.io/api/graphql";

    const c = create({
      url: endpoint,
      appId: creds.appId,
      secret: creds.secret,
    });

    return c;
  }

  p2b(payload: unknown): TasklessBody {
    return {
      v: 1,
      taskless: encode(payload, this.queueOptions.encryptionKey),
    };
  }

  b2p(body: TasklessBody): T {
    return decode(
      body.taskless,
      [
        this.queueOptions.encryptionKey,
        ...(this.queueOptions.expiredEncryptionKeys ?? []),
      ].filter((t) => t)
    );
  }

  /**
   * Recieve a message and execute the handler for it
   * errors are caught and converted to a 500 response, while
   * any success is returned as a 200
   * @param args The req/res pair from common node.js frameworks
   */
  async receive(functions: {
    getBody: GetBodyCallback;
    getHeaders: GetHeadersCallback;
    send: SendJsonCallback;
    sendError: SendJsonCallback;
  }) {
    const { getBody, getHeaders, send, sendError } = functions;
    const body = await getBody();
    if (!isTasklessBody(body)) {
      console.error("Taskless body did not satisfy type checks");
      await sendError({
        route: this.route,
        error:
          "Unable to extract the body from the request. This may happen if you enqueued this endpoint with an incompatible schema.",
      });
      return;
    }

    let payload: T | undefined;
    let h:
      | ReturnType<typeof getHeaders>
      | ReturnType<Awaited<typeof getHeaders>>;
    try {
      payload = this.b2p(body);
      h = await getHeaders();
    } catch (e) {
      console.error(e);
      const isE = e instanceof Error;
      await sendError({
        route: this.route,
        error: "Could not extract body and headers from request",
        details: isE ? e.message : "no message",
        stack: isE ? e.stack ?? "no stack" : "no stack",
      });
      return;
    }

    const meta: JobMeta = {
      applicationId: firstOf(h["x-taskless-application"]) ?? null,
      organizationId: firstOf(h["x-taskless-organization"]) ?? null,
      attempt: parseInt(firstOf(h["x-taskless-attempt"]) ?? "0", 10),
    };

    try {
      const result = await this.handler(payload, meta);
      await send({
        result: result ?? {},
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

  async enqueue(
    name: string | null,
    payload: T,
    options?: JobOptions
  ): Promise<Job<T>> {
    const opts = merge.all<JobOptions>([this.jobOptions, options ?? {}]);
    const client = this.getClient();
    const resolvedName = name ?? v4();
    const body = this.p2b(payload);

    const job = await client.enqueueJob({
      name: resolvedName,
      job: {
        endpoint: this.resolveRoute(),
        method: JobMethodEnum.Post,
        headers: this.headersToGql(opts.headers),
        enabled: opts.enabled === false ? false : true,
        body: JSON.stringify(body),
        retries: opts.retries === 0 ? 0 : opts.retries ?? 0,
        runAt: opts.runAt ?? undefined,
        runEvery: opts.runEvery ?? undefined,
      },
    });

    // populate result
    return {
      name: job.replaceJob.name,
      endpoint: job.replaceJob.endpoint,
      enabled: job.replaceJob.enabled === false ? false : true,
      headers: opts.headers,
      payload,
      retries: job.replaceJob.retries,
      runAt: job.replaceJob.runAt,
    };
  }

  async update(
    name: string,
    payload: T | undefined,
    options?: JobOptions
  ): Promise<Job<T>> {
    const opts = merge.all<JobOptions>([this.jobOptions, options ?? {}]);
    const client = this.getClient();
    const body = undefinedOr(payload, this.p2b(payload));

    const job = await client.updateJob({
      name,
      job: {
        endpoint: this.resolveRoute(),
        method: JobMethodEnum.Post,
        headers: undefinedOr(opts.headers, this.headersToGql(opts.headers)),
        enabled: undefinedOr(
          opts.enabled,
          opts.enabled === false ? false : true
        ),
        body: undefinedOr(body, JSON.stringify(body)),
        retries: undefinedOr(
          opts.retries,
          opts.retries === 0 ? 0 : opts.retries
        ),
        runAt: undefinedOr(opts.runAt, opts.runAt),
        runEvery: undefinedOr(opts.runEvery, opts.runEvery),
      },
    });

    const returnedPayload = this.b2p(JSON.parse(job.updateJob.body ?? ""));

    return {
      name: job.updateJob.name,
      endpoint: job.updateJob.endpoint,
      enabled: job.updateJob.enabled === false ? false : true,
      payload: returnedPayload,
      retries: job.updateJob.retries,
      runAt: job.updateJob.runAt,
    };
  }

  async delete(name: string): Promise<Job<T>> {
    const client = this.getClient();

    const job = await client.deleteJob({
      name,
    });

    if (!job.deleteJob) {
      throw new Error("TODO");
    }

    const returnedPayload = this.b2p(JSON.parse(job.deleteJob.body ?? ""));

    return {
      name: job.deleteJob.name,
      endpoint: job.deleteJob.endpoint,
      enabled: job.deleteJob.enabled === false ? false : true,
      payload: returnedPayload,
      retries: job.deleteJob.retries,
      runAt: job.deleteJob.runAt,
    };
  }

  async get(name: string): Promise<Job<T>> {
    const client = this.getClient();

    const result = await client.getJobByName({
      name,
    });

    if (!result.job) {
      throw new Error("TODO");
    }

    const returnedPayload = this.b2p(JSON.parse(result.job.body ?? ""));

    return {
      name: result.job.name,
      endpoint: result.job.endpoint,
      enabled: result.job.enabled === false ? false : true,
      payload: returnedPayload,
      retries: result.job.retries,
      runAt: result.job.runAt,
    };
  }
}
