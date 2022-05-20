# Getting Started with Taskless and Express

This document guides you through setting up Taskless for Express and creating your first Queue in a new project.

## Installation

Taskless consists of two parts:

1. A _server_ which receives your API requests and will call them at a future defined time and
2. The Taskless _client_ which your application uses to interface with the server

This guide assumes you've already [created a Taskless account](https://taskless.io). The first thing you'll want to do is install the Taskless client and dev server. The `express` integration is available via `@taskless/express`.

We're also going to use [concurrently](https://www.npmjs.com/package/concurrently) to make it easier to start multiple services. This will let us run our express and Taskless servers at the same time.

```sh
# install the package using npm
npm install @taskless/express
npm install --save-dev @taskless/dev concurrently

# or install the package using yarn
yarn add @taskless/express
yarn add -D @taskless/dev concurrently

# or install the package using pnpm
pnpm add @taskless/express
pnpm add -D @taskless/dev concurrently
```

And update your `package.json` to launch the Taskless Dev Server alongside your express app in development.

```json
{
  "scripts": {
    "...": "...",
    "dev": "concurrently -n taskless,express \"yarn:taskless\" \"yarn:start\"",
    "start": "node server.js"
  }
}
```

> ℹ **Tip**
> In development, Taskless assumes your app is running on port **3000**. If that's not the case, launch your server with the `TASKLESS_BASE_URL` env variable set. For example: `TASKLESS_BASE_URL='http://localhost:8080' node server.js`.

That's it for the setup. Let's create our first Queue!

## Creating a Queue

Queues in the Express integration are Queues first, and an [Express Router](https://expressjs.com/en/4x/api.html#router) second. In this example, we're going to create a queue called "echo", which just mirrors the job's body content to the console.

```ts
// routes/queues/echo.ts
import express from "express";
import { createQueue } from "@taskless/express";

/** Describes our queue object **/
type Echo = {
  content: string;
};

export default createQueue<Echo>(
  "My Queue Name", // 👈🏼 The name of this queue
  "/queues/echo", // 👈🏼 The URL path this queue is reachable on
  async (job, meta) => {
    // 👇🏻 When your job executes, this is what runs
    console.log("Received a job with payload and meta:", job, meta);
  }
);
```

Our `createQueue` function takes three required arguments, plus one optional:

1. The `name` of the Queue, making it easier to query and search later (because searching by endpoints isn't always obvious or intuitive)
2. The `path` the route this queue is reachable on
3. The `job` callback. An `async` function that receives your job along with some metadata such as the number of attempts made
4. _(optional)_ Any `QueueOptions` you'd like to override. Most of the time, you can leave this blank and instead use environment variables to configure Taskless. For now, we can omit this.

> ℹ **TypeScript Tip**
> You can define the generic `<T>` on `createQueue` to establish typings for the Job's payload. These types are resurfaced on the `job` parameter in the callback and checked when setting payloads using a method such as `enqueue()`.

Once created, we can use the default export from this file both for enqueueing items and for connecting our express app to the Taskless router.

## Adding Items With `enqueue`

Import your Queue object and call `enqueue()` with a Job name and a payload.

```ts
// /some/hypothetical/file.ts

import EchoQueue from "routes/queues/echo";

EchoQueue.enqueue("job-name", {
  content: "This is a sample message",
});
```

Enqueing a new Job takes two required arguments, plus one optional:

1. The `job name`, which uniquely identifies the job. It's a good idea to provide a recognizable name for debugging purposes. When a Job is enqueued with an identical name, it will be update the existing job while preserving its run history.
2. The `payload` you want to pass to your Job's handler callback (from `createQueue` above)
3. _(optional)_ Any `JobOptions` you'd like to specify for this job such as running the job at a specific time or scheduling the job to repeat. For now, we can omit this.

If you were to call the queue right now, Taskless would receive the result and after 5 tries, would report the job failed due to a 404 error. That's because right now, we haven't told Express how to find our queue.

## Routing to the Queue

Express' routing system doesn't automatically determine routes based on your file/folder structure, so Taskless exposes a `<queue>.router()` method in the Express integration that helps you inform Taskless where it's put. In basic Express applications, you can call `router()` with no arguments.

```ts
// /app.ts
import express from "express";
import EchoQueue from "./routes/queues/echo";

const app = express();
// ... your express app setup

// works with app.use and router.use
app.use(EchoQueue.router());

export default app;
```

> ℹ **Advanced**
> If you're using nested routers, you may call `.router()` with a full path that points to your mount location such as `EchoQueue.router("/mounted/at/subpath")`. This is a limitation in Express Routes, as a single Router removes the ability to inspect the full mount path. [1](https://github.com/expressjs/express/issues/3144)

Now, when you enqueue this job, Taskless will send a request to `/queues/echo` with a signed payload of `{ "content": "This is a sample message" }` at least once, and will confirm it receives a `200` response code. 🎉

## Errors and Retries

By default, returning from your job handler will be seen as a successful call, regardless of return value. If you throw an error or have an unhandled exception, it will be caught by Taskless and the job will be marked as a failing call with the number of retries you specified at the queue and job level.

By default, Taskless will try a Job 5 times before giving up. These runs are available on the Development Server or via taskless.io.

## Next

While this is a fabricated example designed to show how to build Queues with Taskless, there's a variety of other ways you can leverage a queueing system:

- **Improve the Critical Path** - with Edge servers around the world, Taskless is faster than almost every other API. Move event based actions such as email verification or calling Mailchimp/Zapier APIs out of the main path, giving users a faster response time
- **Schedule User-Centric Crons** - with full timezone support, Taskless jobs can run relative to a user's timezone. Spread that 3am Cron job out to 3am relative to every user and avoid the "Thundering Herd" problem
- **Massive Fan Out** - Optimized for edge processing, Taskless loves small digestible tasks. If you can do it in a Lambda, you can do it (later) in Taskless

There's no limit to what you can build.

_View the full Express example at [github:taskless/examples/express](https://github.com/taskless/taskless/tree/main/examples/express)_

## Related

For more information on what to do next, we recommend the following sections:

- **Details**
  - [@taskless/express](/docs/packages/express.md) - View the full Express integration docs
  - [Environment](/docs/packages/client/env.md) - Learn about the environment variables Taskless uses
  - [@taskless/dev](/docs/packages/dev.md) - Learn about the Taskless Dev Server
- **Concepts**
  - [Jobs](/docs/concepts/jobs.md) - Learn the difference between Evented and Scheduled Jobs in Taskless
  - [Encryption](/docs/concepts/encryption.md) - Learn how end-to-end encryption works with Taskless
