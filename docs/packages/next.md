# @taskless/next

## createQueue

```ts
function createQueue<T>(
  queueName: string,
  path: string,
  handler: JobHandler<T>,
  queueOptions?: QueueOptions
): TasklessNextApiHandler<T>;

interface JobHandler<T> {
  (payload: T, meta: JobMetadata): Promised<unknown>;
}

interface TasklessNextApiHandler<T> extends NextApiHandler {
  (request: NextApiRequest, response: NextApiResponse): void | Promise<void>;
  enqueue: CreateQueueMethods<T>["enqueue"];
  update: CreateQueueMethods<T>["update"];
  delete: CreateQueueMethods<T>["delete"];
  get: CreateQueueMethods<T>["get"];
  withQueue: (wrappedHandler: NextApiHandler) => TasklessNextApiHandler<T>;
}
```

`createQueue` is the primary way to create an Next.js-ready handler for Taskless. It takes in the standard arguments for creating a queue, and returns a Taskless compliant API with additional methods specific to the Next.js framework.

### Core Methods

These core methods are available on any Taskless integration.

`enqueue(name: string, payload: T, jobOptions?: JobOptions): Promise<Job<T>>`
Add a job to the queue named `name` with `payload`. Returns the `Job` instance created. If a job already exists with the specified `name`, it will be updated and return the updated `Job` values

`update(name: string, payload: T, jobOptions?: JobOptions): Promise<Job<T>>`
Similar to `enqueue` but will throw an error if a `Job` with the specified `name` already exists

`delete(name: string): Promise<Job<T> | null>`
Delete a job by the specified `name`, and return the `Job` or `null` if no deletion occured

`get(name: string): Promise<Job<T> | null>`
Retrieve a `Job` from Taskless named `name`, or `null` if no matches found

### Next.js Methods

`withQueue(wrappedHandler: NextApiHandler): TasklessNextApiHandler`
When using integrations such as [sentry for next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/#configure), your next.js handler is wraped in a manner that obscures the Taskless methods. When this happens, calls to the core methods such as `enqueue` will result in an error trying to call an undefined value. To work around this limitation, the Next.js intergation exposes `withQueue` method, which will reattach the core methods to the provided `NextApiHandler`.

## Exported from @taskless/client

In addition to the above, the following items are rexported from `@taskless/client` as a convienence.

- [JobError](./client/job-error.md) An error object capable of handling advanced [return codes](./client/return-codes.md)
- [Queue](./client/queue.md) The Taskless Queue object for advanced integrations
- [JobOptions](./client/job-options.md) the set of Job options that can be passed into the Taskless client via `queueOptions.defaultJobOptions` on creation as a default for all Jobs in the queue. Can also be passed to `enqueue` and `update` to change the runtime configuration of a Job.
- [core Taskless types](https://github.com/taskless/taskless/tree/main/packages/types) for Typescript users
