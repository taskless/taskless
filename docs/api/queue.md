# Queue

Queues are the backbone of Taskless, representing both the dispatch and reception of Jobs.

## Queue Options

Most Queue options at creation time have equivalent values in `process.env` that will be checked if not explicitly set during Queue creation. However, it may at times be useful to override a specific queue, change its encryption keys, or set specific default job options.

For more information on environment variables beyond the definition below, see [Environment Variables](./env.md) for a full list.

```ts
type QueueOptions = {
  /** The base url, defaults to process.env.TASKLESS_BASE_URL */
  baseUrl?: string;

  /** Your Application's credential pair */
  credentials?: {
    /**
     * The Application ID from Taskless
     * If unset, will default to process.env.TASKLESS_APP_ID
     */
    appId: string;
    /**
     * The secret for Application ID
     * If unset, will default to process.env.TASKLESS_APP_SECRET
     */
    secret: string;
    /**
     * A list of expired / rotated secrets to maintain compatibility
     * for unprocessed jobs. If unset, will default to a comma
     * separated string in process.env.TASKLESS_PREVIOUS_APP_SECRETS
     * and will be automatically split into an array by Taskless.
     */
    expiredSecrets?: string[];
  };

  /**
   * An optional encryption key for e2e encryption of job data.
   * Defaults to process.env.TASKLESS_ENCRYPTION_KEY. Must be
   * set in either the process.env or at Queue creation in
   * production to enable end-to-end encryption
   */
  encryptionKey?: string;

  /**
   * Previous encryption keys to assist in key rotation. If using
   * process.env.TASKLESS_PREVIOUS_ENCRYPTION_KEYS, a comma separated list
   * will be automatically split into an array for you
   */
  expiredEncryptionKeys?: string[];

  /** A default set of job options to apply to every job created in this queue */
  jobOptions?: JobOptions;
};
```

## Job Options

Job Options can either be specified via the `jobOptions` configuration in `QueueOptions`, or passed as a third argument in a Queue's `enqueue` or `update` method. In addition to enabling or disabling a job, the most common use of `JobOptions` is to schedule to running and recurrence of a Job.

```ts
type JobOptions = {
  /** Is the job enabled. Defaults to true. */
  enabled?: boolean;

  /** A key/value object to recieve as headers when your job is called. Defaults to an empty object */
  headers?: JobHeaders;

  /** The number of retries to attempt before the job is failed. Defaults to 5 */
  retries?: number;

  /**
   * An time to run the job, delaying it into the future in
   * ISO-8601 format. An explicit value of `null` will result in the job
   * running at the first available opportunity
   */
  runAt: string | null;

  /** An optional ISO-8601 Duration that enables repeated running of a job*/
  runEvery?: string;
};
```

### ISO-8601 Dates and Durations

For consistency across platforms and to enable support for timezones, Taskless uses [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) for both Dates and Durations.

```
# This date represents April third, 2022
# with a timestamp of 9:32 PM (with 28.264 seconds)
# with a UTC offset of -7:00
2022-04-03T21:32:28.264-07:00
```

ISO-8601 Durations are incredibly powerful, but are less intuitive than the dates. For example, to run a job every hour, you would specify a `runEvery` value of `PT1H`.

```
# All durations begin with "P" for a peroid, and all units are optional
# A "T" separates the year/month/day from hour/minute/second
# PnYnMnDTnHnMnS
#  | | |  | | |
#  | | |  | |  \ seconds
#  | | |  |  \ minutes
#  | | |   \ hours
#  | |  \ days
#  |  \ months
#   \ years
```

As a quick reference, the following table is examples of durations and their cron-like equivalents.

| Duration | Cron         | Description                                                    |
| :------- | :----------- | :------------------------------------------------------------- |
| `PT1H`   | `0 * * * *`  | Runs once per hour                                             |
| `P1D`    | `0 3 * * *`  | Run at 3am every day (set `runAt` to the next 3 am)            |
| `P1M`    | `0 * 27 * *` | Run on the 27th of every month (set `runAt` to the next 27th)  |
| `P1M-4D` | none         | Run four days before the end of the month (no cron equivalent) |

When combined with `runAt`, `runEvery` offers a richer set of configurable options. When using the main Taskless site and specifying a Cron value, we convert it to an appropriate ISO-8601 duration expression.

## Queue Methods

### Create a Job `.enqueue()`

_Create or Replace a Job in Taskless_

```ts
import MyQueue, { Job } from "....";

const job = await MyQueue.enqueue(
  name as string,
  payload as Job,
  jobOptions as JobOptions
);
```

- `name` (`string`) A unique name for this job within your application. Usually, jobs are scoped to a user, owner, or other identifying token.
- `payload` (`<T>`) Your job payload. If you defined the typing for `<T>` when creating your Queue, your payload will be type-checked against this value.
- `jobOptions` ([JobOptions](#job-options)) Describes overrides to the Job Options for this specific Job such as a specific `runAt` value or an alternate number of `retries`.

**Enqueing a Job of the Same Name** If you enqueue a job with the same `name` property, the Job will instead be updated to your new configuration. This makes it easier to write idempotent tasks and debounce your job during periods of high activity.

**Returns** A `Promise` that resolves to the [Job](./job) object generated from this method.

### Update a Job `.update()`

_Update an Job in Taskless, failing if the Job does not exist_

```ts
import MyQueue, { Job } from "....";

const job = await MyQueue.update(
  name as string,
  payload as Job,
  jobOptions as JobOptions
);
```

- `name` (`string`) A unique name for this job within your application.
- `?payload` (`<T>`, optional) Your job payload. If you defined the typing for `<T>` when creating your Queue, your payload will be type-checked against this value.
- `?jobOptions` ([JobOptions](./job.md#joboptions), optional) Describes overrides to the Job Options for this specific Job such as a specific `runAt` value or an alternate number of `retries`.

Updating a Job (instead of the default `enqueue()` method) is rarely used, but made available for operations such as altering a repeating task with new data. If a Job of the specified `name` does not exist, then `update()` will throw an error.

**Returns** A `Promise` that resolves to the [Job](./job.md) object updated from this method.

### Delete a Job `.delete()`

_Remove a Job in Taskless, including its run history_

```ts
import MyQueue from "....";

const job = await MyQueue.delete(name as string);
```

- `name` (`string`) A unique name for this job within your application.

Deleting the Job should be seen as a last resort (for example, sensitive information exposed in the body payload). Instead, consider using `enqueue` or `update` to change the Job's `enabled` state to `false` which will prevent future runs.

**Returns** A `Promise` that resolves to the [Job](./job.md) object deleted by this method.

### Retrieve a Job `.get()`

_Fetch a Job in Taskless by name_

```ts
import MyQueue from "....";

const job = await MyQueue.get(name as string);
```

Retrieving a Job may be important to ongoing health checks or reporting, and is provided as a convienence to the GraphQL API. If you'd prefer to retrieve detailed Job information, run history, and invocation logs, consider using the Taskless Dashboard instead of programatic access.

- `name` (`string`) A unique name for this job within your application.

**Returns** A `Promise` that resolves to the [Job](./job.md) object retrieved by this method, or `null` if no job exists with the specified name.

## Creating a Queue Directly

```ts
import { Queue } from "@taskless/client";

type Job = {
  /* typeof Job */
};

const queue = new Queue<Job>({
  route: route as string,
  handler: async function handler(job: Job, meta) {},
  queueOptions: queueOptions as QueueOptions,
  jobOptions: jobOptions as JobOptions,
});
```

All Taskless integrations via `createQueue` make use of the underlying Queue object. The Queue constructor takes a single `config` object that defines the core properties of the Queue.

- `route` A string describing the url pathName to reach this Queue
- `handler` A promise-returning function that will receive the job payload and metadata as arguments.
- `queueOptions` A set of [`QueueOptions`](#queue-options) for this queue. You can use the config to set defaults for every job in the queue, and override default environment values
- `jobOptions` A set of default [`JobOptions`](#job-options) that will be applied to every Job in the queue
