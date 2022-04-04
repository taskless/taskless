# createQueue for Express

```ts
import { createQueue } from "@taskless/client/express";

interface TasklessExpressRouter<T> extends QueueMethods<T> {
  router: express.Router;
}

type Job = {
  /* typeof job */
};

const Queue: TasklessExpressRouter = createQueue<Job>(
  path as string,
  async function callback(job: Job, meta) {},
  config as QueueOptions
);
export default Queue;
```

- See [createQueue](./createQueue.md) for the queue methods and options shared by all integrations

In addition, `createQueue` for Express also exposes the following methods & properties

- `.router` An Express-compatible Router instance, suitable for mounting to your application root

## System Requirements

The Express integration requires `"express": ">= 4.16.0"` and is referenced as an optional peer dependency of `@taskless/client`.
