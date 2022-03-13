# Getting Started with Taskless and Next.js

This document guides you through setting up Taskless for Next.js and creating your first Queue in an existing project.

## Installation

Taskless consists of two parts:

1. A _server_ which receives your API requests and will call them at a future defined time and
2. The Taskless _client_ which your application uses to interface with the server

This guide assumes you've already [created a Taskless account](https://taskless.io/signup). The first thing you'll want to do is install the Taskless client. The `next` integration is bundled with the main `@taskless/client` npm package, and available as a tree-shaking friendly import.

<!-- tabs -->

### npm

```sh
# install the package using npm
npm install @taskless/client
```

### yarn

```sh
# install the package using yarn
yarn add @taskless/client
```

### pnpm

```sh
# install the package using pnpm
pnpm add @taskless/client
```

<!-- /tabs -->

That's everything you need to create your first Queue!

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

`createQueue` takes three arguments:

1. The `path` the API route is publicly reachable on. This is combined with your base url to create a full URL that Taskless should ping
2. The `job` callback. An async function that receives your job along with any additional metadata
3. The `options` for the Queue, which can be ommitted since we'll define our environment variables using Next's env pattern

## Environment Variables

In order for Taskless to use our Queue, we'll set up some environment variables using the [built in env support in next.js](https://nextjs.org/docs/basic-features/environment-variables). Create a `.env.local` file, add the file to your `.gitignore` if it isn't already, and specify your `TASKLESS_BASE_URL`, `TASKLESS_APP_ID`, and `TASKLESS_SECRET`. We'll also set `TASKLES_REFLECT=1` to avoid using our invocations.

```bash
# /.env.local

# Enables Taskless Reflect, which enables local development
# by skipping the external Queue
TASKLESS_REFLECT=1

# The base URL is the public URL your app is accessible on
TASKLESS_BASE_URL=http://localhost:3000

# These credentials come from your Taskless dashboard:
TASKLESS_APP_ID=your_appid_here
TASKLESS_SECRET=your_app_secret_key

# This value secures your data by encrypting it before sending to Taskless
# set it to a sufficiently long string
TASKLESS_ENCRYPTION_KEY=

# You can include previous encryption keys, comma `,` separated
# in case you need to rotate your TASKLESS_ENCRYPTION_KEY to a new value
# but have jobs that need to run using the old key still.
TASKLESS_PREVIOUS_ENCRYPTION_KEYS=
```

<!-- info -->

> :information_source: The `TASKLESS_REFLECT=1` tells the Taskless Queue not to send requests to the Taskless server. This is incredibly useful in development, as otherwise we'd need to use a tool such as ngrok or webhook.site to make our Queue accessible on a non-localhost URL

<!-- /info -->

## Using a Queue

The `createQueue` both creates a Next API Handler and attaches the Taskless Queue methods. Using the queue is as simple as importing the page just like any other module and calling the `enqueue` method. We'll create an API endpoint that we can visit which triggers our job in Taskless.

```ts
// /api/trigger-echo

import Queue from "./queues/echo";

export default async function (req: NextAPIRequest, res: NextAPIResponse) {
  const job = await Queue.enqueue(null, {
    content:
      "This is a test string, generated at: " + new Date().toLocaleString(),
  });
  res.status(200).json({
    message: "Job was scheduled successfully with name: " + job.name,
    job,
  });
}
```

The `enqueue` method takes three arguments:

1. An optional `name` for your job. If set to `null`, a uuid will be generated, though it's often helpful to specify the name of the job you're running.
2. Your Job's `payload`. If using TypeScript, it will be automatically typechecked against your Queue's payload description
3. A set of options for the Job, allowing retries, delayed runs, and repeated jobs.

Accessing the URL `http://localhost:3000/api/trigger-echo` will trigger a call to the Taskless server and enqueue your job. Since we've enabled Taskless Reflect, we'll see a note in the console that our endpoint is being run immediately. A moment later, we'll see our "Received a job" string with our payload. Success!
