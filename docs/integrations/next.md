---
title: Next.js and Taskless
---

# {% $frontmatter.title %}

The Next.js integration is available via the npm package `@taskless/next` and follows the standard [createQueue](/docs/api/create) convention. The returned object is both a Taskless aware API as well as a `NextAPIHandler` and can be placed in the standard `/pages/api/<queue-name>` location.

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

interface TasklessNextApiHandler<T> extends NextApiHandler, QueueMethods<T> {
  (request: NextApiRequest, response: NextApiResponse): void | Promise<void>;
  withQueue: (wrappedHandler: NextApiHandler) => TasklessNextApiHandler<T>;
}
```

### Next Specific Methods

`withQueue(wrappedHandler: NextApiHandler): TasklessNextApiHandler`
When using integrations such as [sentry for next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/#configure), your next.js handler is wrapped in a manner that obscures the Taskless methods. When this happens, calls to the core methods such as `enqueue` will result in an error trying to call an undefined value. To work around this limitation, the Next.js integration exposes `withQueue` method, which will reattach the core methods to the provided `NextApiHandler`.
