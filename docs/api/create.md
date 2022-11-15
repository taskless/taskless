---
title: Creating a Queue
---

# {% $frontmatter.title %}

Creating a Queue is the first step in Taskless; a Queue object is both a dispatcher of requests to the Taskless service and also a receiver of jobs when it's time to execute and run them. Because Taskless jobs are powered by Serverless Lambda functions, you only pay for the compute time you're actively using when running jobs. The easiest way to create a queue is to use one of the existing intgerations, or just include the Raw Client and create a new Queue object manually.

## Using an Integration

Taskless integrations all follow the same format: `import { createQueue } from "@taskless/<integration>`, followed by `createQueue(name, route, handler, options)`.

{% tabs %}

{% tab label="Next.js" %}

When using Next.js, you can use the `createQueue` method that comes bundled with `@taskless/next`. The returned object is a typed `NextAPIHandler`, decorated with Taskless methods.

```ts
// next.js
// /pages/api/example-queue
import { createQueue } from "@taskless/next";

const MyQueue = createQueue(
  "example-queue", // <= The name of the queue
  "/api/example-queue", // <= The URL to this API route
  async (job, meta) => {
    // your job handler
  },
  {
    // queueOptions
  }
);
```

{% /tab %}

{% tab label="Express" %}

The Express.js integration provides a bundled `createQueue` method in `@taskless/express` that works seamlessly with the Express.js ecosystem. The returned object is an instance of `Express.Router`, decorated with Taskless methods.

```ts
// /routes/example-queue
import { createQueue } from "@taskless/express";

const MyQueue = createQueue(
  "example-queue", // <= The name of the queue
  "/example-queue", // <= The URL to this express route
  async (job, meta) => {
    // your job handler
  },
  {
    // queueOptions
  }
);
```

{% /tab %}

{% tab label="Raw Client" %}

Using the raw client is a little more verbose, because there is no framework hints to tell Taskless where the body, headers, and response sending utilities are. While other frameworks will manage receiving the job for us, we will need to import and call `receive` ourselves with the necessary context.

```ts
import { Queue } from "@taskless/client";

const MyQueue = new Queue({
  name: "example-queue", // <= The name of the queue
  route: "/example-queue", // <= The URL to this handler
  handler: (job, meta) => {
    // your job handler
  },
  queueOptions: {
    // queueOptions
  },
});
```

```ts
// using micro & microrouter to handle the request in your service
import MyQueue from "path/to/example-queue";
import { router, post } from "microrouter";
import { send, json } from "micro";

export default router(
  post("/example-queue", async (req, res) => {
    return MyQueue.receive({
      getBody: () => json(req),
      getHeaders: () => req.headers,
      send: (obj) => send(res, 200, obj),
      sendError: (code, headers, e) => {
        Object.values(headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        send(res, code, e);
      },
    });
  })
);
```

{% /tab %}

{% /tabs %}

### `name` Defining the Queue Name {% #name %}

Every queue in Taskless has a name, which you can specify via your taskless.io Dashboard. This name helps separate your queue traffic, providing per-queue usage, logs, and error reporting. Names of queues in Taskless are lower-case and URL safe. If you pass in a queue that doesn't match these values, Taskless will convert your queue name to a URL-safe version via the following regular expression:

`/[^a-z0-9-_]/-/`

### `route` The Queue Route {% #route %}

Every Queue that is going to receive data from Taskless requires a routable URL. In most scenarios, you can set this value to a string minus your domain and `https` prefix. The value of `route` is combined with your `process.env.TASKLESS_BASE_URL` to create a final routable URL.

### `handler` The Job Handler {% #handler %}

`handler` is an asynchronous function that takes two arguments: `job` (your job payload) and `metadata` (info about the job). This is where the processing magic happens. Execute your job, call other microservices, do whatever work needs doing, and then return something useful. Taskless will capture this response and mark the job as succeeded, scheduling any followup work that needs to be done.

Throwing an error inside of `handler` will mark the job as failing, up to the number of retries you've specified for the job.

## `queueOptions` Settings for the Queue {% #queue-options %}

The `queueOptions` set both the options for the queue, as well as any default `JobOptions` you'd like to specify; everything from your credentials to the default number of retries you'd like. All Queue options can be set via [environment variables](#taskless-environment-variables).

```ts
interface QueueOptions {
  baseUrl?: string;
  separator?: string;
  credentials?: {
    projectId?: string;
    secret?: string;
    expiredSecrets?: string[];
  };
  encryptionKey?: string;
  expiredEncryptionKeys?: string[];
  jobOptions?: JobOptions;
  __dangerouslyAllowUnverifiedSignatures?: {
    allowed: boolean;
  };
}
```

`baseUrl?: string`
**Default `process.env.TASKLESS_BASE_URL ?? ""`** The `baseUrl` property tells Taskless how to construct a route to the Queue, including the protocol, domain name, and port. Most commonly, you'll set this value to something like `http://localhost:3000` in development and `https://myapp.com` in production.

`separator?: string`
**Default `/`** When using arrays as a Job Identifier, this character is used to separate the namespacing of keys. **NOTE: Changing the separator when there are jobs in the queue can result in `enqueue()` creating duplicate jobs as the ID of a job will change.** In most cases, `/` should be good enough.

`credentials.projectId?: string`
**Default `process.env.TASKLESS_ID` falls back to `undefined` in production, `0000...` in development** Identifies the project to Taskless or the development server. Combined with your secret, this ensures that only you are sending and receiving traffic for your application. It's recommended to take this values from an environment variable, so that it is not committed to your codebase.

`credentials.secret?: string`
**Default `process.env.TASKLESS_SECRET` falls back to `undefined` in production, `taskless.development` in development** Your application secret is used both to send requests to Taskless.io and to verify the signature of incoming webhooks. In production and when talking to taskless.io, an application secret must be set. In development, a default secret is used for local testing that ensures your payloads are still signed and verified.

`credentials.expiredSecrets?: string[]`
**Default `process.env.TASKLESS_PREVIOUS_SECRETS.split(",") ?? []`** It is possible that your app secret may have gotten out, been committed, or caught up in a data breach. Taskless makes it straightforward to rotate your secret. Expired secrets are used to check the signing data of any incoming webhooks, but are not used to send any data back to Taskless. If defined in `process.env`, you can set `TASKLESS_PREVIOUS_SECRETS` to a comma separated set of strings and let Taskless take care of the rest.

`encryptionKey?: string`
**Default `process.env.TASKLESS_ENCRYPTION_KEY ?? ""`** To enable end-to-end encryption, you should set the `encryptionKey` to a sufficiently long and protected secret value. Internally, this value will be packed down and used as the key for AES-256-GCM encryption. In the future, we may emit warnings if running in a production environment without an encryption key set.

`expiredEncryptionKeys?: string[]`
**Default `process.env.TASKLESS_PREVIOUS_ENCRYPTION_KEYS.split(",") ?? []`** Similar to your application secret, encryption keys can be rotated. In the event that you need to rotate your keys, you can add previous keys (comma separated) either to the environment value or directly to the Queue configuration. When attempting to decrypt payloads, the Taskless client will try all previous encryption secrets before giving up. New data sent to Taskless will always be encrypted with the new encryption key, making it safe to remove an expired key after a period of time.

`jobOptions?: JobOptions`
**Default see [JobOptions](/docs/api/enqueue#job-options)** Specify job options that will be applied to every job in the queue. Sensible defaults are included, but you may wish to change these (such as disabling retries or passing additional headers) with every request.

`__dangerouslyAllowUnverifiedSignatures?: { allowed: boolean; };`
**Default `undefined`** Allows you to explicitly allow unverified signatures. By default, the Taskless client checks the signatures of all incoming payloads against your `credentials.secret` and `credentials.expiredSecrets` values. If set, this option will disable those checks for the provided queue. When setting this flag, please be sure that you are confirming the payload's authenticity in another manner, either through request headers, IP origins, or your own signature checking system.

## Taskless Environment Variables

Most options in Taskless can be represented via [Environment Variables](https://en.wikipedia.org/wiki/Environment_variable) or colloquially "env" values. Env values are not committed to your repository and often contain sensitive information such as secrets. Most deployment targets including Vercel, Heroku, and Netlify all allow you to specify env values as part of your app's configuration.

Taskless recommends storing the bulk of your configuration in env values.

- `TASKLESS_ID` (example: `abcdef...000001`) Your project's unique ID from Taskless.io
- `TASKLESS_SECRET` (example: `xgt1_aBCd612...`) Your project's secret token from Taskless.io
- `TASKLESS_BASE_URL` (example: `http://localhost:1234`) Defines the protocol, domain, and port for your application
- `TASKLESS_ENCRYPTION_KEY` (example: `alonguniquestring...`) Your encryption key for end-to-end encryption
- `TASKLESS_PREVIOUS_SECRETS` (example: `xgt1_abc,xgt1_def`) Previous application secrets, comma separated
- `TASKLESS_PREVIOUS_ENCRYPTION_KEYS` (example: `key1,key2...`) Previous encryption keys, comma separated

**Development ENV Values** Additionally, the following env values may be useful in development.

- `TASKLESS_ENV` (example: `development`) Used to override the `NODE_ENV` value, specifically for Taskless
- `TASKLESS_ENDPOINT` (example: `http://localhost:8080/api/graphql`) Changes the GraphQL endpoint used by the client. When not set, Taskless will select a default URL based on the value of `process.env.TASKLESS_ENV ?? process.env.NODE_ENV`. Changing this value is useful if you are running the Taskless Dev Server on a different port or for sending jobs to your production Taskless instance from development. The default endpoints are:
  - **development** `http://localhost:3001/api/graphql`
  - **production** `https://for.taskless.io/api/graphql`

Taskless also is aware of the following environment variables if set

- `CI` (example `1`) When set, Taskless will treat the environment as if it is development for the purposes of emitting warnings instead of throwing errors
- `SILENT` (example `1`) When set, Taskless will silence all warnings and logs
