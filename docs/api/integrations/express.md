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
  options as ExpressQueueOptions
);
export default Queue;
```

- See [createQueue](/docs/api/integrations/createQueue.md) for the queue methods and options shared by all integrations

In addition, `createQueue` for Express also exposes the following methods & properties

- `.mount(path)` Informs the Taskless Queue it was mounted at a sub-path when using Express' nested routers. Unfortunately, [mountpath](http://expressjs.com/en/api.html#app.mountpath) is only available on the `app` object and not on the Router, so we must inform Taskless where it was placed.

## System Requirements

The Express integration requires `"express": ">= 4.16.0"` and is referenced as an optional peer dependency of `@taskless/client`.
