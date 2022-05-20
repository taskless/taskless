# Getting Started with Taskless and Next.js

This document guides you through setting up Taskless for Next.js and creating your first Queue in a new project.

## Installation

Taskless consists of two parts:

1. A _server_ which receives your API requests and will call them at a future defined time and
2. The Taskless _client_ which your application uses to interface with the server

This guide assumes you've already [created a Taskless account](https://taskless.io). The first thing you'll want to do is install the Taskless client and dev server. The `next` integration available via `@taskless/next`.

We're also going to use [concurrently](https://www.npmjs.com/package/concurrently) to make it easier to start multiple services. This will let us run our express and Taskless servers at the same time.

```sh
# install the package using npm
npm install @taskless/next
npm install --save-dev @taskless/dev concurrently

# or install the package using yarn
yarn add @taskless/next
yarn add -D @taskless/dev concurrently

# or install the package using pnpm
pnpm add @taskless/next
pnpm add -D @taskless/dev concurrently
```

And update your `package.json` to launch the Taskless Dev Server alongside your next.js app in development.

```json
{
  "scripts": {
    "...": "...",
    "dev": "concurrently -n taskless,next taskless 'next dev'"
  }
}
```

> ℹ **Tip**
> In development, Taskless assumes your app is running on port **3000**. If that's not the case, launch your server with the `TASKLESS_BASE_URL` env variable set. For example: `"TASKLESS_BASE_URL='http://localhost:8080' taskless"`.

That's it for the setup. Let's create our first Queue!

## Creating a Queue

Queues in the Next.js integration are both a standard [Next.js API Route](https://nextjs.org/docs/api-routes/introduction) and a Taskless Queue. In this example, we're going to create a queue called "echo", which just mirrors the job's body content to the console. Taskless comes with an integration pre-built for Next.js, available under `@taskless/client/next`.

```ts
// /pages/api/queues/echo.ts

import { createQueue } from "@taskless/next";

/** Describes our queue object **/
type Echo = {
  content: string;
};

export default createQueue<Echo>(
  "My queue name", // 👈🏼 A memorable name for the queue
  "/api/queues/echo", // 👈🏼 The URL path this queue is reachable on
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

Routes in next.js are handled automatically for us, meaning any requests sent to `/api/queues/echo` will be sent directly to Taskless.

## Adding Items With `enqueue`

Import the API endpoint and call the `enqueue()` method with a Job name and payload.

```ts
// /some/hypothetical/file.ts

import EchoQueue from "pages/api/queues/echo";

const job = await EchoQueue.enqueue("job-name", {
  content: "This is a sample message",
});
```

Enqueing a new Job takes two required arguments, plus one optional:

1. The `job name`, which uniquely identifies the job. It's a good idea to provide a recognizable name for debugging purposes. When a Job is enqueued with an identical name, it will be update the existing job while preserving its run history.
2. The `payload` you want to pass to your Job's handler callback (from `createQueue` above)
3. _(optional)_ Any `JobOptions` you'd like to specify for this job such as running the job at a specific time or scheduling the job to repeat. For now, we can omit this.

When you enqueue this job via `enqueue`, Taskless will send a request to `/api/queues/echo` with a signed payload of `{ "content": "This is a sample message" }` at least once, and will confirm it receives a `200` response code. 🎉

## Errors

By default, returning from your job handler will be seen as a successful call, regardless of return value. If you throw an error or have an unhandled exception, it will be caught by Taskless and the job will be marked as a failing call with the number of retries you specified at the queue and job level.

## Next

While this is a fabricated example designed to show how to build Queues with Taskless, there's a variety of other ways you can leverage a queueing system:

- **Improve the Critical Path** - with Edge servers around the world, Taskless is faster than almost every other API. Move event based actions such as email verification or calling Mailchimp/Zapier APIs out of the main path, giving users a faster response time
- **Schedule User-Centric Crons** - with full timezone support, Taskless jobs can run relative to a user's timezone. Spread that 3am Cron job out to 3am relative to every user and avoid the "Thundering Herd" problem
- **Massive Fan Out** - Optimized for edge processing, Taskless loves small digestible tasks. If you can do it in a Lambda, you can do it (later) in Taskless

There's no limit to what you can build.

_View the full Next.js example at [github:taskless/examples/nextjs](https://github.com/taskless/taskless/tree/main/examples/nextjs)_

## Related

For more information on what to do next, we recommend the following sections:

- **Details**
  - [@taskless/next](/docs/packages/next.md) - View the full Next.js integration docs
  - [Environment](/docs/packages/client/env.md) - Learn about the environment variables Taskless uses
  - [@taskless/dev](/docs/packages/dev.md) - Learn about the Taskless Dev Server
- **Concepts**
  - [Jobs](/docs/concepts/jobs.md) - Learn the difference between Evented and Scheduled Jobs in Taskless
  - [Encryption](/docs/concepts/encryption.md) - Learn how end-to-end encryption works with Taskless
