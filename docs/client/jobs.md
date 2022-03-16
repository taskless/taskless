# Taskless Jobs

Every integration includes a set of methods for interacting with the Taskless API. While you should reference your integration docs for creating the Queue obeject, once it is created you'll have access to the same consistent set of Queue Methods.

## The Job Options Object [api docs](./api/modules/types.md#joboptions)

A Taskless Job has a set of default options cofigured at [queue creation](./queues.md) which can be overriden for each individual job.

```ts
const options = {
  enabled: true,
  headers: {},
  retries: 5,
  runAt: undefined,
  runEvery: undefined,
};
```

- `options.enabled` (`boolean`, optional, default `true`) Specifies if the job is enabled. A job set to `enabled: false` will be removed from the pending job queue. If a job was in the middle of dispatching then this value changes, then the Job will still complete.
- `options.headers` (`[key: string]: string`, optional, default `{}`) Specifies additional headers to merge when making this request. By default, requests from the Taskless Client will include a `"content-type": "application/json"` header in order to support the client payload format.
- `options.retries` (`number`, optional, default `5`) Specifies the number of attempts a job will be tried before giving up. Internally, a retried job will be placed back into the outgoing queue with an exponential backoff.
- `options.runAt` (`string`, optional) An [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) time string for when you want the job to be executed. If the time is ommitted or is a time in the past, the Job will be ran at the first available opportunity. Example: `2022-03-16T14:45:00-07:00` refers to March 16, 2022 at 2:45 pm in the Pacific Daylight Time (PDT) zone. Providing offset information allows you to schedule jobs relative to your user's time zone with tools such as [luxon](https://moment.github.io/luxon/#/)
- `options.runEvery` (`string`, optional) An [ISO-8601 Duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) string describing an amount of time after `runAt` the next occurence should be. For example, `P3Y6M4DT12H30M5S` represents a duration of "three years, six months, four days, twelve hours, thirty minutes, and five seconds".
  - To run a job every day at the same time: `P1D`
  - To run a job once a month on the same day of the month: `P1M`
  - To run a job 5 days before the end of every month: `P1M-5D`

## Create a Job `.enqueue()`

_Create or Replace a Job in Taskless_

```ts
import MyQueue from "....";

const job = await MyQueue.enqueue(name, payload, jobOptions);
```

- `name` (`string | null`) A unique name for this job within your application. Usually, jobs are scoped to a user, owner, or other identifying token. Creating a string with this token makes it easier to remove the job later via a method such as `.delete()`, and makes it easier to identify issues with a Job via the `name` property in the [JobMeta](./api/modules/types.md#jobmeta). Passing `null` will let Taskless auto-generate a Job name for you, which is useful for one-off operations.
- `payload` (`<T>`) Your job payload. If you defined the typing for `<T>` when creating your Queue, your payload will be type-checked against this value.
- `jobOptions` ([JobOptions](./api/modules/types.md#joboptions)) Describes overrides to the Job Options for this specific Job such as a specific `runAt` value or an alternate number of `retries`.

**Enqueing a Job of the Same Name** If you enqueue a job with the same `name` property, the Job will instead be updated to your new configuration. This makes it easier to write idempotent tasks and debounce your job during periods of high activity.

**Returns** A `Promise` that resolves to the [Job](./api/modules/types.md#job) object generated from this method.

## Update a Job `.update()`

_Update an Job in Taskless, failing if the Job does not exist_

```ts
import MyQueue from "....";

const job = await MyQueue.update(name, payload, jobOptions);
```

- `name` (`string`, optional) A unique name for this job within your application.
- `?payload` (`<T>`, optional) Your job payload. If you defined the typing for `<T>` when creating your Queue, your payload will be type-checked against this value.
- `?jobOptions` ([JobOptions](./api/modules/types.md#joboptions), optional) Describes overrides to the Job Options for this specific Job such as a specific `runAt` value or an alternate number of `retries`.

Updating a Job (instead of the default `enqueue()` method) is rarely used, but made available for operations such as altering a repeating task with new data. If a Job of the specified `name` does not exist, then `update()` will throw an error.

**Returns** A `Promise` that resolves to the [Job](./api/modules/types.md#job) object updated from this method.

## Delete a Job `.delete()`

_Remove a Job in Taskless, including its run history_

```ts
import MyQueue from "....";

const job = await MyQueue.delete(name);
```

- `name` (`string`, optional) A unique name for this job within your application.

Deleting the Job should be seen as a last resort (for example, sensitive information exposed in the body payload). Instead, consider using `enqueue` or `update` to change the Job's `enabled` state to `false` which will prevent future runs.

**Returns** A `Promise` that resolves to the [Job](./api/modules/types.md#job) object deleted by this method.

## Retrieve a Job `.get()`

_Fetch a Job in Taskless by name_

```ts
import MyQueue from "....";

const job = await MyQueue.get(name);
```

Retrieving a Job may be important to ongoing health checks or reporting, and is provided as a convienence to the GraphQL API. If you'd prefer to retrieve detailed Job information, run history, and invocation logs, consider using the Taskless Dashboard instead of programatic access.

- `name` (`string`, optional) A unique name for this job within your application.

**Returns** A `Promise` that resolves to the [Job](./api/modules/types.md#job) object retrieved by this method, or `null` if no job exists with the specified name.
