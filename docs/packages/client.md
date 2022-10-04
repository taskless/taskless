---
title: "@taskless/client"
---

# {% $frontmatter.title %}

```ts
class Queue<T> {
  constructor(args: TasklessQueueConfig<T>): Queue<T>;
  receive(functions: ReceiveCallbacks): Promise<void>;
  enqueue(name: string, payload: T, jobOptions?: JobOptions): Promise<Job<T>>;
  cancel(name: string): Promise<Job<T> | null>;
}

interface TasklessQueueConfig<T> {
  name: string;
  route: string | (() => string);
  handler?: JobHandler<T>;
  queueOptions?: QueueOptions;
}

interface JobHandler<T> {
  (payload: T, meta: JobMetadata): Promised<unknown>;
}

interface ReceiveCallbacks {
  getBody: () => Promised<TasklessBody>;
  getHeaders: () => Promised<IncomingHttpHeaders>; // from node:http
  send: (json: unknown) => Promised<void>;
  sendError: (
    statusCode: number,
    headers: OutgoingHttpHeaders, // from node:http
    json: unknown
  ) => Promised<void>;
}
```

Taskless Queues are stateless classes that only need to persist for the lifecycle of their request. Values set in the constructor are used during `receive` in order to handle an incoming request, or used by the core methods (enqueue & remove). The ultimate goal of the client is to translate developer friendly JavaScript APIs into GraphQL calls to the Taskless.io API in production and emulated RPC calls to the [Taskless Dev Server](/docs/packages/dev) in development.

## Constructing a Queue

While the `createQueue` interface is a more natural API, the `TasklessQueueConfig` provides all of the same arguments in an object literal. This allows us to add new features and options to the Queue, without forcing possibly breaking changes on the integrations.

- `name: string` Describes the name of the queue, already defined on taskless.io
- `route: string | (() => string)` Describes the route this queue is reachable on. If `typeof route === "function"`, then the route will be evaluated as lazily as possible. This allows for integrations such as [express](/docs/packages/express) to handle a late-binding of the route parameter in situations where the Taskless queue is not yet mounted to the routing structure
- `handler?: JobHandler<T>` The handler for the job of payload type `<T>`. If undefined, the `Queue` may still be used in order to enqueue and remove Jobs. However, without `handler` defined, attempts to receive a job via `Queue.receive` will throw an error
- `queueOptions?: QueueOptions` The options for the queue. These allow you to override items for this specific Queue such as the application ID or encryption keys. [See the full list of QueueOptions](/docs/packages/client/queue-options), including how to set default job options for all jobs created in this queue

## Core Methods

### enqueue

`enqueue(name: string, payload: T, jobOptions?: JobOptions): Promise<Job<T>>`
Add a job to the queue named `name` with `payload`. Returns the `Job` instance created. If a job already exists with the specified `name`, it will be updated and return the updated `Job` values

### cancel

`cancel(name: string): Promise<Job<T> | null>`
Cancel a job, removing it from the active queue by the specified `name`. Returns `null` if there is no matching job with the specified `name`. Can be ran multiple times safely.

## Receiving Jobs

A Taskless Queue object can also receive job payloads through the `receive` method. Because Taskless has no information about how to retrieve items from the node request object, `receive` asks the invoking code to provide callbacks for retrieving the body and headers, as well as sending results and errors as JSON payloads.

- `getBody()` returns the request body, which is assumed to be a JSON object conforming to the `TasklessBody` type. The type guard `isTasklessBody` is available in the `Guards.TasklessBody` export if needed. If the body payload cannot conform to `TasklessBody`, then an error should be thrown
- `getHeaders()` returns the incoming HTTP headers, which is where Taskless looks for the attempt count, organization identifier, and application identifier
- `send(json: unknown)` is used to send a successful JSON response, normally with a status code of `200`
- `sendError(statusCode: number, headers: OutgoingHttpHeaders, json:unknown)` is used to send an error based JSON response. In addition to setting the requested error code and headers, the provided JSON should be sent as the response payload

## Additional Reading

- [Environment Variables](/docs/packages/client/env) Taskless Client uses several environment variables in order to reduce configuration in the `QueueOptions` object
- [QueueOptions](/docs/packages/client/queue-options) the set of Queue options that can be passed into the Taskless client on creation
- [JobOptions](/docs/packages/client/job-options) the set of Job options that can be passed into the Taskless client via `queueOptions.defaultJobOptions` on creation as a default for all Jobs in the queue. Can also be passed to `enqueue` and `update` to change the runtime configuration of a Job.
- [Return Codes](/docs/packages/client/return-codes) beyond `200` and `500` can be controlled with Taskless' `JobError` object
