---
title: Enqueueing Jobs
---

# {% $frontmatter.title %}

The `enqueue()` method is the primary way to add a job to Taskless. When you call `enqueue()`, your payload is [encrypted e2e](/docs/features/encryption), signed with your Taskless Secret, and sent for later processing. The general format of an enqueue call is:

```ts
import MyQueue from "your/queue/location";

await MyQueue.enqueue(
  "identifier",
  {
    // payload
  },
  {
    // options
  }
);
```

## Job Identifiers

Jobs in Taskless are identified by their `name` property. Names are considered unique to the queue and are case & space sensitive.

Once created, you cannot change the name of an existing job. Sending a Job to Taskless with a new name will create a new Job. In most circumstances, this is perfectly ok, as the job history for the prior job is still maintained, just under the previous identifier.

## Job Payloads

Job payloads are typically JS Objects, though any payload that can be stringified can be used instead. If you'd like to use an alternate library such as [superjson](https://github.com/blitz-js/superjson), it's recommended to simply create this as a key for your payload.

```ts
import superjson from "superjson";

const payload = {
  superjson: superjson.stringify({ date: new Date(0) }),
};
```

## Job Options

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

Because Taskless is aware of Timezones, it is always useful to set your `runAt` in the ideal timezone you wish to run with. When a job is scheduled across a time change such as Daylight Savings Time, Taskless will _do the right thing_ and ensure that your execution time is correct both before and after the switch.

`runEvery?: string | null`
**Default: `null`** An [ISO-8601 Duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) or a [5-segment crontab expression](https://crontab.guru/) that describes how long to wait between jobs. Generally, ISO-8601 durations are a more useful format than traditional crons, as they are calendar aware. That is, a duration of `P1M` represents `1 month`, regardless of if the month is Febuary or July. Here are some sample `runAt` and `runEvery` values that show the power of ISO Durations.

| `runAt`                    | `runEvery` | `next`                     | `next + 1`                 |
| :------------------------- | :--------- | :------------------------- | :------------------------- |
| `2022-05-01T00:00:00.000Z` | `P1M`      | `2022-06-01T00:00:00.000Z` | `2022-07-01T00:00:00.000Z` |
| `2022-05-31T00:00:00.000Z` | `P1M`      | `2022-06-30T00:00:00.000Z` | `2022-07-30T00:00:00.000Z` |
| `2022-05-01T00:00:00.000Z` | `PT5M`     | `2022-05-01T00:05:00.000Z` | `2022-05-01T00:10:00.000Z` |

`timezone?: string`
**Default: `undefined`** Allows you to specify an [IANA Timezone](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) for this job. When jobs have their `runEvery` value set, Taskless will use the `timezone` when calculating the next execution.
