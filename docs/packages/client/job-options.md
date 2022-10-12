---
title: Job Options
---

# {% $frontmatter.title %}

```ts
type JobOptions = {
  enabled?: boolean;
  headers?: JobHeaders;
  retries?: number;
  runAt?: string | null;
  runEvery?: string | null;
};

interface JobHeaders extends OutgoingHttpHeaders {
  "x-taskless-application"?: string;
  "x-taskless-organization"?: string;
  "x-taskless-attempt"?: string;
}
```

`JobOptions` control the behavior of a job and are managed separate from the Job's payload. Unless set, all values have a sensible default. When updating a job via `enqueue()` or `update()`, you may optionally set some values to `null` to clear a field entirely.

`enabled?: boolean`
**Default: `true`** Determines if the job is enabled.

`headers?: JobHeaders`
**Default: `{ "content-type": "application/json" }`**
A set of `OutgoingHttpHeaders`, with additional typings reserved for the Taskless webhook, prefixed by `x-taskless-`.

`retries?: number`
**Default: `5`** A number of tries to attempt calling the webhook. When a non-200 status is retrieved and retries remain, the job will be attempted again after a backoff period.

`runAt?: string | null`
**Default: `null`** An [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) Timestamp of when the job should be executed. A value of `null` will be interpreted as a request to run the job immediately. When working with ISO-8601 dates, we recommend the [luxon](https://www.npmjs.com/package/luxon) library thanks to its complete ISO-8601 support and the ability to transition seamlessly between JS date objects and the ISO format. There's more in the luxon docs than we're going to cover here, but these are some useful statements to generate specific `runAt` values:

| [luxon](https://www.npmjs.com/package/luxon) statement                 | Example value                   |
| :--------------------------------------------------------------------- | :------------------------------ |
| `DateTime.now().toUTC().startOf("month").toISO()`                      | `2022-05-01T00:00:00.000Z`      |
| `DateTime.utc().setZone("America/Los_Angeles").startOf("day").toISO()` | `2022-05-20T00:00:00.000-07:00` |
| `DateTime.fromJSDate(new Date()).toISO()`                              | `2022-05-20T11:15:12.173-03:00` |

`runEvery?: string | null`
**Default: `null`** An [ISO-8601 Duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) that describes how long to wait between jobs. Generally, ISO-8601 durations are a more useful format than traditional crons, as they are calendar aware. That is, a duration of `P1M` represents `1 month`, regardless of if the month is Febuary or July. Here are some sample `runAt` and `runEvery` values that show the power of ISO Durations.

| `runAt`                    | `runEvery` | `next`                     | `next + 1`                 |
| :------------------------- | :--------- | :------------------------- | :------------------------- |
| `2022-05-01T00:00:00.000Z` | `P1M`      | `2022-06-01T00:00:00.000Z` | `2022-07-01T00:00:00.000Z` |
| `2022-05-01T00:00:00.000Z` | `PT5M`     | `2022-05-01T00:05:00.000Z` | `2022-05-01T00:10:00.000Z` |

## Default Options

When using `JobOptions` as part of `createQueue()` or the constructor for `Queue`, options will be applied as defaults for all jobs created in the queue.

## Additional Reading

- [QueueOptions](/docs/packages/queue-options) the set of Queue options that can be passed into the Taskless client on creation
