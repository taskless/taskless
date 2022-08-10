# Queue Options

```ts
interface QueueOptions {
  baseUrl?: string;
  separator?: string;
  credentials?: {
    /** @deprecated */
    appId?: string;
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

When creating a `Queue`, either through [@taskless/client](../client.md) or one of the integrations, you may control the configuration and setup of a Queue through the use of `QueueOptions`. The majority of options for Queue creation can be retrieved from [environment variables](./env.md). Where possible, they will also use sensible defaults.

`baseUrl?: string`
**Default `process.env.TASKLESS_BASE_URL ?? ""`** The `baseUrl` property tells Taskless how to construct a route to the Queue, including the protocol, domain name, and port. Most commonly, you'll set this value to something like `http://localhost:3000` in development and `https://myapp.com` in production.

`separator?: string`
**Default `/`** When using arrays as a [Job Identifier](../../concepts/jobs.md#job-identifiers), this character is used to separate the namespacing of keys. **NOTE: Changing the separator when there are jobs in the queue can result in `enqueue()` creating duplicate jobs as the ID of a job will change.** In most cases, `/` should be good enough.

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
**Default see [JobOptions](./job-options.md)** Specify job options that will be applied to every job in the queue. Sensible defaults are included, but you may wish to change these (such as disabling retries or passing additional headers) with every request.

`__dangerouslyAllowUnverifiedSignatures?: { allowed: boolean; };`
**Default `undefined`** Allows you to explicitly allow unverified signatures. By default, the Taskless client checks the signatures of all incoming payloads against your `credentials.secret` and `expiredSecrets` values. If set, this option will disable those checks for the provided queue. When setting this flag, please be sure that you are confirming the payload's authenticity in another manner, either through request headers, IP origins, or your own signature checking system.

## Additional Reading

- [JopOptions](./job-options.md) details on the Job Options which can be set as defaults for all Jobs created in this queue
