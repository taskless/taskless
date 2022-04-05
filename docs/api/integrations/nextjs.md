# createQueue for Next.js

```ts
import { createQueue } from "@taskless/client/next";

type NextMethods<T> = {
  withQueue: (wrappedHandler: NextApiHandler) => TasklessNextApiHandler<T>;
};

interface TasklessNextApiHandler<T>
  extends NextApiHandler,
    QueueMethods<T>,
    NextMethods<T> {}

type Job = {
  /* typeof job */
};

const Queue: TasklessNextApiHandler<Job> = createQueue<Job>(
  path as string,
  async function callback(job: Job, meta) {},
  config as QueueOptions
);
export default Queue;
```

- See [createQueue](/docs/api/integrations/createQueue.md) for the queue methods and options shared by all integrations

In addition, `createQueue` for Next.js also exposes the following methods & properties

- `.withQueue(handler)` Rewraps a `NextApiHandler` and reattaches the queue methods. When using an integration such as Sentry which requires you to wrap the entire handler, you can wrap that returned object in `withQueue` to re-expose the Taskless queue methods.

## System Requirements

The Next.js integration requires `"next": "^10.0.8 || ^11.0 || ^12.0"` and is referenced as an optional peer dependency of `@taskless/client`.
