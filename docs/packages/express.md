---
title: "@taskless/express"
---

# {% $frontmatter.title %}

## createQueue

```ts
function createQueue<T>(
  queueName: string,
  path: string,
  handler: JobHandler<T>,
  queueOptions?: QueueOptions
): TasklessExpressRouter<T>;

interface JobHandler<T> {
  (payload: T, meta: JobMetadata): Promised<unknown>;
}

interface TasklessExpressRouter<T> {
  enqueue: CreateQueueMethods<T>["enqueue"];
  cancel: CreateQueueMethods<T>["cancel"];
  router: (mount?: string) => express.Router;
}
```

`createQueue` is the primary way to create an Express-ready handler for Taskless. It takes in the standard arguments for creating a queue, and returns a Taskless compliant API with additional methods specific to express.

### Core Methods

These core methods are available on any Taskless integration.

`enqueue(name: string, payload: T, jobOptions?: JobOptions): Promise<Job<T>>`
Add a job to the queue named `name` with `payload`. Returns the `Job` instance created. If a job already exists with the specified `name`, it will be updated and return the updated `Job` values

`cancel(name: string): Promise<Job<T> | null>`
Cancel a job, removing it from the active queue by the specified `name`. Returns `null` if there is no matching job with the specified `name`. Can be ran multiple times safely.

### Express Methods

`router(mount?: string): express.Router`
Create an [Express Router](https://expressjs.com/en/4x/api.html#router), optionally mounted to the subroute path of `mount`. In larger Express apps, it is common to nest routers as a form of code organization. When Taskless queues are not being mounted to the application root via `app.use()`, it is necessary to tell Taskless where its queue was placed. The `mount` argument lets you specify a full mount location for the Taskless Router. Without this information, Taskless cannot construct a proper URL during `enqueue()` that will end up back at your Job handler.

## Exported from @taskless/client

In addition to the above, the following items are reexported from `@taskless/client` as a convenience.

- [JobError](/docs/packages/client/job-error) An error object capable of handling advanced [return codes](/docs/packages/client/return-codes)
- [Queue](/docs/packages/client/queue) The Taskless Queue object for advanced integrations
- [JobOptions](/docs/packages/client/job-options) the set of Job options that can be passed into the Taskless client via `queueOptions.defaultJobOptions` on creation as a default for all Jobs in the queue. Can also be passed to `enqueue` and `update` to change the runtime configuration of a Job.
- [core Taskless types](https://github.com/taskless/taskless/tree/main/packages/types) for Typescript users
