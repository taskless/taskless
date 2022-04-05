# Getting Started with Taskless and Next.js

This document guides you through setting up Taskless for Next.js and creating your first Queue in a new project.

## Installation

Taskless consists of two parts:

1. A _server_ which receives your API requests and will call them at a future defined time and
2. The Taskless _client_ which your application uses to interface with the server

This guide assumes you've already [created a Taskless account](https://taskless.io). The first thing you'll want to do is install the Taskless client and dev server. The `next` integration is bundled with the main `@taskless/client` npm package, and available as a tree-shaking friendly import.

We're also going to use [concurrently](https://www.npmjs.com/package/concurrently) to make it easier to start multiple services.

```sh
# install the package using npm
npm install @taskless/client
npm install --save-dev @taskless/dev concurrently

# or install the package using yarn
yarn add @taskless/client
yarn add -D @taskless/dev concurrently

# or install the package using pnpm
pnpm add @taskless/client
pnpm add -D @taskless/dev concurrently
```

And update your `package.json` to launch the Taskless Dev Server alongside your next app in development.

```json
{
  "scripts": {
    "...": "...",
    "dev": "concurrently -n taskless,next taskless 'next dev'"
  }
}
```

That's it for the setup. Let's create our first Queue!

## Creating a Queue

Queues in the Next.js integration are both a standard [Next.js API Route](https://nextjs.org/docs/api-routes/introduction) and a Taskless Queue. In this example, we're going to create a queue called "echo", which just mirrors the job's body content to the console.

```ts
// /pages/api/queues/echo.ts

import { createQueue } from "@taskless/client/next";

/** Describes our queue object **/
type Echo = {
  content: string;
};

export default createQueue<Echo>(
  "/api/queues/echo", // 👈🏼 The URL path this queue is reachable on
  async (job, meta) => {
    console.log("Received a job with payload and meta:", job, meta);
  }
);
```

Our `createQueue` function takes two arguments:

1. The `path` the API route is publicly reachable on. This is combined with your base url to create a full URL that Taskless should ping
2. The `job` callback. An async function that receives your job along with any additional metadata

## Routing to the Queue

Next.js takes care of automatically routing requests to our API endpoint. If we're using a provider with edge functions such as Vercel, these API routes will also be packaged up for a serverless environment.

## Adding Items

With the queue set up, sending items to your Queue is as easy as importing the queue and calling the `enqueue` method.

```ts
// /some/hypothetical/file.ts

import EchoQueue from "pages/api/queues/echo";

const job = await EchoQueue.enqueue("job-name", {
  content: "This is a sample message",
});
```

Enqueing a new Job takes two required arguments.

1. The `jobName`, which uniquely identifies the job. It's a good idea to provide a recognizable name for debugging purposes. It can be either a string `"<name>" + uniqueid`, or an array of values which will be collapsed into a key `["name", uniqueId]`. When a job is enqueued with an identical name, it will be updated to the new payload; making it easy to search and track when a job is rerun.
2. The `payload`, as was defined during your `createQueue` function

When you enqueue this job, Taskless will moments later call `/queues/echo` with the payload `{ "content": "This is a sample message" }` at least once, and will confirm it receives a `200` response code.

## Next

While this is a fabricated example designed to show how to build Queues with Taskless, there's a variety of other ways you can leverage a queueing system:

- Move event based actions such as email verification or calling Mailchimp APIs out of the main path, giving users faster responses
- Generate contact suggestions at a time relative to each individual user, spreading work and resource usage out over the day
- Do computationally expensive operations one chunk at a time while reusing your serverless infrastructure

There's no limit to what you can build.

_View the full Next.js example at [github:taskless/examples/nextjs](https://github.com/taskless/taskless/tree/main/examples/nextjs)_

## Related

For more information on what to do next, we recommend the following sections:

- [integrations/next](/docs/api/integrations/nextjs.md) - The Next.js Integration
- [Jobs](/docs/concepts/jobs.md) - Learn the difference between Evented and Scheduled Jobs in Taskless
- [Environment Variables](/docs/api/env.md) - Before going to production, learn what environment variables Taskless looks for
- [Encryption](/docs/concepts/encryption.md) - Learn how end-to-end encryption works with Taskless
- [Dev Server](/docs/features/dev-server.md) - Learn about the Taskless Dev Server
