# Taskless Queues

## Creating a Queue `createQueue()`

The easiest way to create a Taskless Queue is with an [Integration for your Framework](../get-started/README.md). Taskless supports many frameworks out of the box under the namespace `@taskless/client/<framework>`, including Next.js, Express, Remix, and more. Queue creation follows the same general structure, declaring the route your queue is reachable on, the callback for handling jobs, a set of [queue options](#queue-options), and the default [job options](#job-option-defaults).

```ts
import { createQueue } from "@taskless/client/<framework>";

export default createQueue<T>(
  route,
  async (job, meta) => {
    // handles your job of type <T>
  },
  queueOptions,
  jobOptions
);
```

## Creating a Queue `new Client()`

Creating a Taskless Client lets you manage the integration entirely on your own. To create a Taskless Client, you'll pass it a set of options that describe its URL, a callback for handling jobs, a set of [queue options](#queue-options), and the default [job options](#job-option-defaults).

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

## Queue Options

When creating a Taskless Queue, all queue options default to associated `process.env` values.

| `option.*`                   | `process.env.*`                     | description                                   |
| :--------------------------- | :---------------------------------- | :-------------------------------------------- |
| `baseUrl`                    | `TASKLESS_BASE_URL`                 | The root URL of your application              |
| `credentials.appId`          | `TASKLESS_APP_ID`                   | Your Taskless App ID                          |
| `credentials.secret`         | `TASKLESS_APP_SECRET`               | Your Taskless App Secret                      |
| `credentials.expiredSecrets` | `TASKLESS_PREVIOUS_APP_SECRETS`     | Previous application secrets                  |
| `encryptionKey`              | `TASKLESS_ENCRYPTION_KEY`           | A secure passphrase for end-to-end encryption |
| `expiredEncryptionKeys`      | `TASKLESS_PREVIOUS_ENCRYPTION_KEYS` | Previous encryption keys                      |

In order to support key rotation, both your `credentials.secret` and `encryptionKey` have a corresponding key and env value for previous keys. Previous keys are not used for new data, but still allow you to decrypt and verify existing data that has not been processed yet.

## Job Option Defaults

Specify default [Job Options](./jobs.md#the-job-options-object-api-docsapimodulestypesmdjoboptions) which will apply to every job in the Queue. Useful for setting global retries on assigning a default `runEvery` to all jobs made in a given Queue.

## Queue Actions

Once created, either through a functional constructor such as `createQueue` or directly instantiated as `new Client()`, the Taskless Queue object exposes a series of methods for creation & replacing [`.enqueue()`](./jobs.md#create-a-job-enqueue), updating [`.update()`](./jobs.md#update-a-job-update), and deleting [`.delete()`](./jobs.md#delete-a-job-delete). You can call these methods by simply importing the Queue object.

When using the Taskless Client directly, you'll make calls directly against the class instance.

When using a `createQueue` wrapper, you'll make calls against proxy functions automatically attached to your frameworks API handler syntax.
