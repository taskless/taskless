# Using the Queue Object Directly

Creating a Taskless Queue directly lets you manage the integration with a framework entirely on your own. This class is also used by the Taskless framework integrations, making it an accessible low level solution with a stable API.

## Creating a Taskless Queue

To create a Taskless Queue, you'll pass it a set of options that describe its routable URL, a callback for handling jobs, a set of [queue options](/docs/api/queue.md#queue-options), and the default [job options](/docs/api/queue.md#job-options).

```ts
import { Queue } from "@taskless/client";

const queue = new Queue<T>({
  route: "/route/to/this/queue",
  handler: async (job, meta) => {
    // handles your job of type <T>
  },
  queueOptions: {},
  jobOptions: {},
});
```

- `route`: The URL path name this Queue will be reachable on
- `handler`: A Promise-returning callback that recieves a Job of type `T` and associated metadata
- `queueOptions`: The [`QueueOptions`](/docs/api/queue.md#queue-options) for this queue
- `jobOptions`: The default [`JobOptions`](/docs/api/queue.md#job-options) for this queue

## Exposing Taskless Queue Methods

The Taskless Queue includes `enqueue`, `update`, `delete`, and `get`. You may optionally implement wrappers around any of these depending on your needs. Most intgerations attach identically named methods to their API Handler, passing the values directly through to the Taskless Queue.

## Receiving Requests

To get an inbound request, you will need to call `.receive()` on your Queue and pass it a collection of callbacks. These callbacks enable the Taskless Queue to be unconcerned with your framework implementation, asking for data instead of guessing at methods. Every function passed to `.receive()` should return a Promise.

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

## Examples

- [next.js](https://github.com/taskless/taskless/blob/main/packages/taskless/src/integrations/next.ts) is a full example of creating a custom intgeration that adhears to the Next.JS API signature while also providing the standard set of Taskless methods. Additionally, it exposes `withQueue`, a pattern that's used for Next.js middleware when wrapping handlers with new behavior.

## Related

- [Queue Documentation](/docs/api/queue.md)
