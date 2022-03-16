# Using the Taskless JS Client

Creating a Taskless Client lets you manage the integration with a framework entirely on your own. All of Taskless' integrations also use the Taskless Client, adding a set of wrapper functions to an API endpoint that leverage the underlying class instance.

## Creating a Taskless Client

To create a Taskless Client, you'll pass it a set of options that describe its URL, a callback for handling jobs, a set of [queue options](#queue-options), and the default [job options](#job-option-defaults).

```ts
import { Client } from "@taskless/client";

const client = new Client<T>({
  route: "/route/to/this/client",
  handler: async (job, meta) => {
    // handles your job of type <T>
  },
  queueOptions: {},
  jobOptions: {},
});
```

- `route`: The URL path name this client will be reachable on
- `handler`: A [JobHandler](../client/api/modules/types.md#jobhandler) callback that recieves a Job of type `T` and associated metadata
- `queueOptions`: A set of [queue options](../client/api/modules/types.md#queueoptions)
- `jobOptions`: A set of default [job options](../client/api/modules/types.md#joboptions)

## Exposing Taskless Queue Methods

The Taskless Client includes `enqueue`, `update`, `delete`, and `get`. You may optionally implement any of these depending on your needs. Most intgerations attach identically named methods to their API Handler, passing the values directly through to the Taskless Client.

## Receiving Requests

To get an inbound request, you will need to call `.receive()` and pass it a series of callbacks. These callbacks enable the Taskless Client to be unconcerned with your framework implementation by asking for data instead of guessing methods. Every property passed to receive should return a Promise.

```ts
client.receive({
  async getBody() {},
  async getHeaders() {},
  async send(obj) {},
  async sendError(obj) {},
});
```

- `getBody`: Retrieve the JSON body from the request, parsed into an object using `JSON.parse` or equivalent
- `getHeaders`: Retrieves the key:value pairs that make up the HTTP headers sent to your endpoint
- `send(obj)`: Given a JSON object, call your responses' success code and then send the JSON as the result
- `sendError(obj)`: Given a JSON object, call your responses' error code and then send the JSON as the result

## Examples

- [next.js](../../packages/taskless/src/next.ts) is a full example of creating a custom intgeration that adhears to the Next.JS API signature while also providing the standard set of Taskless methods
