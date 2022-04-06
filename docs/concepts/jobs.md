# Jobs in Taskless

Jobs in Taskless take two primary forms: **Evented Jobs** which are in response to either a user's action (or even another Job), and **Scheduled Jobs** which occur and/or recur after a period of time. Under the hood, _a Scheduled Job is just an Evented Job with a known delay_ but it's useful to think of the concepts separately when planning your Queues.

# Evented Jobs

Evented Jobs are the "do it, but not right now" of the Taskless world. Users expect applications to be _fast_, and that means taking everything that isn't critical to the experience and doing it in the background. Evented Jobs do just that; take heavy or slow tasks, process them out of band, and free your app up to respond as fast as possible to the user.

Some great ideas for how to use Evented Jobs include

- Sending your verification email on signup
- Building and archiving a PDF
- Optimizing an avatar and uploading it to S3
- Following up on a mobile push notification to check the delivery receipt

## Creating an Evented Job

Since Evented Jobs are the default Job type in Taskless, when you call `.enqueue()` with your requested paramters, you'll create an Evented Job.

## Job Names

Jobs that are running in Taskless should be unique. It's okay to reuse a name for a completed Job, and it can be helpful for debugging since doing so groups all related runners and logs together on Taskless.io.

A common practice is to prefix or namespace your Job names, such that you are creating a unique Job for a specific user or other piece of identifying information.

```ts
const jobName = `sendWelcomeEmail:${userId}`;
```

The above name is likely to be unique to that `userId`, but also provides enough searchable information that we can find the Job on Taskless.io if needed. Additionally, if we need to (for whatever reason) change the welcome email timing, it's trivial for us to regenerate the Job name and call `.update()` or `.enqueue()`.

## Disabling and Deleting Jobs

Jobs can be both disabled (by calling `.enqueue()` or `.update()` with `enabled: false`) or deleted (by calling `.delete()`). Generally speaking, it's better to disable a job than to delete it, as deleting the job removes its runners and log history from the Taskless servers. Old runners and logs are automatically cleaned up based on your plan's settings, meaning you'll rarely want `.delete()` except when needing to ensure all references of a Job are removed entirely.

# Scheduled Jobs

Scheduled Jobs behave similarly to Evented Jobs, but use the `runAt` and `runEvery` properties of the [`JobOptions`](/docs/api/queue.md#job-options).

- `runAt` is an [ISO-8601 Date and Time](https://en.wikipedia.org/wiki/ISO_8601), specifying a point in the future when a job should be run
- `runEvery` is an [ISO-8601 Duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) that, if set, specifies a recurring amount of time after `runAt` in which a job will be repeated

Using ISO-8601 Durations instead of a conventional Cron value has a few key advantages, specifically around localization and negative values. First, a duration value respects the timezone specified in `runAt`. So, for example, if you have created a Scheduled Job for a user with a `runAt` timezone of "Americas/Los Angeles", a Duration Value of `P1D` will respect the timezone and run the recurring job at the same time every day in the target timezone.

Second, Durations can be negative values as well. For example, to generate an invoice on the 4th to last day of the month, you can specify a `runEvery` of `P1M-4D` (every one month minus four days). An expression like this is impossible to express in a conventional crontab format without the `L` extension.

## Creating a Scheduled Job

To create a Scheduled Job, pass a `runAt` and (optionally) a `runEvery` value during your `.enqueue()` or `.update()` method. For convenience, we're using the excellent [luxon](https://www.npmjs.com/package/luxon) library, though you could also use [`Date.prototype.toISOString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) and manually express the duration as a string.

```ts
import MyQueue from "....";
import { DateTime, Duration } from "luxon";

// ...
MyQueue.enqueue(
  "my-job-name",
  {
    // job payload
  },
  {
    // first run is 3am tomorrow, Eastern (New York) time
    runAt: DateTime.now()
      .setZone("America/New_York")
      .startOf("day")
      .plus({ days: 1 })
      .set({ hour: 3 })
      .toISO(),
    // runs every day
    runEvery: Duration.fromObject({ days: 1 }).toISO(),
  }
);
```

## Creating a Cron Job

> :information_source: Coming Soon

If you have scheduled jobs that you'd prefer to manage with a more traditional cron similar to a service such as [EasyCron](https://www.easycron.com/) or [Cronhooks.io](https://cronhooks.io/), you can do that from the **New Job** button on the Taskless.io Dashboard. When you are setting up the Job, you can select "using cron" as your recurrence method. Instead of providing a `runAt` and `runEvery` value, you can input a standard `s m h d m y` crontab value. Taskless will figure out when the next occurence is and will set up appropriate `runAt` and `runEvery` values for you.

\_Taskless Cron Jobs do not support overly complex contabs. If you do need a complex crontab such as `*/3 1-5 * 1,8 *`, please [open an issue](https://github.com/taskless/taskless/issues/new/choose) to help us understand your use case.
