---
title: Getting Started with the Base JS Client
---

# {% $frontmatter.title %}

Creating a Taskless Queue directly lets you manage the integration with a framework entirely on your own. This package is also used by the Taskless framework integrations, making it an accessible low level solution with a stable API.

## Creating a Taskless Queue

To create a Taskless Queue, you'll pass it a set of options that describe its routable URL, a callback for handling jobs, a set of [queue options](/docs/api/create#queue-options), and the default [job options](/docs/api/enqueue#job-options).

```ts
import { Queue } from "@taskless/client";

const queue = new Queue<T>({
  route: "/route/to/this/queue",
  name: "my-queue-name",
  handler: async (job, meta) => {
    // handles your job of type <T>
  },
  queueOptions: {},
  jobOptions: {},
});
```

- `route`: The URL path name this Queue will be reachable on
- `name`: A URL-safe name for the queue, max 100 characters
- `handler`: A Promise-returning callback that receives a Job of type `T` and associated metadata
- `queueOptions`: The [`QueueOptions`](/docs/api/create#queue-options) for this queue
- `jobOptions`: The default [`JobOptions`](/docs/api/enqueue#job-options) for this queue

## Exposing Taskless Queue Methods

The Taskless Queue includes `enqueue` and `remove`. You may optionally implement wrappers around any of these depending on your needs. Most integrations attach identically named methods to their API Handler, passing the values directly through to the Taskless Queue.

## Receiving Requests

To get an inbound request, you will need to call `.receive()` on your Queue and pass it a collection of callbacks. These callbacks enable the Taskless Queue to be unconcerned with your framework implementation, asking for data via a pre-agreed-upon API. Every function passed to `.receive()` should return a Promise.

```ts
queue.receive({
  async getBody() {},
  async getHeaders() {},
  async send(obj) {},
  async sendError(obj) {},
});
```

- `getBody`: Retrieve the body from the request, parsed into an object using `JSON.parse` or equivalent
- `getHeaders`: Retrieves the key + value pairs that make up the HTTP headers sent to your endpoint
- `send(obj)`: Given a JSON object as an argument, generate a success response and deliver the provided JSON argument as the result
- `sendError(obj)`: Given a JSON object as an argument, generate an error response (most often 500) and deliver the provided JSON argument as the result

## Errors

By default, returning from your job handler will be seen as a successful call, regardless of return value. If you throw an error or have an unhandled exception, it will be caught by Taskless and the job will be marked as a failing call with the number of retries you specified at the queue and job level.

## Examples

- [@taskless/next](https://github.com/taskless/taskless/blob/main/packages/next/src/index.ts) is a full example of creating a custom integration that adheres to the Next.JS API signature while also providing the standard set of Taskless methods. Additionally, it exposes `withQueue`, a pattern that's used for Next.js middleware when wrapping handlers with new behavior.

## Related

For more information on what to do next, we recommend the following sections:

- [API Overview](/docs/api) - Learn about the Taskless API methods in greater detail
- [Dev Server](/docs/features/dev-server) - Learn more about the Taskless Dev Server you set up in this guide
- [Encryption](/docs/features/encryption) - Learn how end-to-end encryption works with Taskless
