---
title: "@taskless/next"
---

# {% $frontmatter.title %}

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
  cancel: CreateQueueMethods<T>["cancel"];
  withQueue: (wrappedHandler: NextApiHandler) => TasklessNextApiHandler<T>;
}
```

`createQueue` is the primary way to create an Next.js-ready handler for Taskless. It takes in the standard arguments for creating a queue, and returns a Taskless compliant API with additional methods specific to the Next.js framework.

### Core Methods

These core methods are available on any Taskless integration.

`enqueue(name: string, payload: T, jobOptions?: JobOptions): Promise<Job<T>>`
Add a job to the queue named `name` with `payload`. Returns the `Job` instance created. If a job already exists with the specified `name`, it will be updated and return the updated `Job` values

`cancel(name: string): Promise<Job<T> | null>`
Cancel a job, removing it from the active queue by the specified `name`. Returns `null` if there is no matching job with the specified `name`. Can be ran multiple times safely.

### Next Methods

`withQueue(wrappedHandler: NextApiHandler): TasklessNextApiHandler`
When using integrations such as [sentry for next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/#configure), your next.js handler is wrapped in a manner that obscures the Taskless methods. When this happens, calls to the core methods such as `enqueue` will result in an error trying to call an undefined value. To work around this limitation, the Next.js integration exposes `withQueue` method, which will reattach the core methods to the provided `NextApiHandler`.

## Exported from @taskless/client

In addition to the above, the following items are reexported from `@taskless/client` as a convenience.

- [JobError](/docs/packages/client/job-error) An error object capable of handling advanced [return codes](/docs/packages/client/return-codes)
- [Queue](/docs/packages/client) The Taskless Queue object for advanced integrations
- [JobOptions](/docs/packages/client/job-options) the set of Job options that can be passed into the Taskless client via `queueOptions.defaultJobOptions` on creation as a default for all Jobs in the queue. Can also be passed to `enqueue` and `update` to change the runtime configuration of a Job.
- [core Taskless types](https://github.com/taskless/taskless/tree/main/packages/types) for Typescript users
