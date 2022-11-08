---
title: Express.js and Taskless
---

# {% $frontmatter.title %}

The express.js integration is available via the npm package `@taskless/express` and follows the standard [createQueue](/docs/api/create) convention. The returned object is both a Taskless aware API as well as an object capable of exporting an `Express.Router` for use in your express.js apps.

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

interface TasklessExpressRouter<T> extends QueueMethods<T> {
  router: (mount?: string) => express.Router;
}
```

## Express Specific Methods

`router(mount?: string): express.Router`
Create an [Express Router](https://expressjs.com/en/4x/api.html#router), optionally mounted to the subroute path of `mount`. In larger Express apps, it is common to nest routers as a form of code organization. When Taskless queues are not being mounted to the application root via `app.use()`, it is necessary to tell Taskless where its queue was placed. The `mount` argument lets you specify a full mount location for the Taskless Router. Without this information, Taskless cannot construct a proper URL during `enqueue()` that will end up back at your Job handler.
