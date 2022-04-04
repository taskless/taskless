# Introduction to Taskless

Welcome to Taskless! Taskless is designed to take the infrastructure pain out of setting up and maintaing a Job Queueing system, and excels in a serverless or edge-function environment though it can be used anywhere you've got publicly reachable URLs and wish to call them on a schedule or in response to a user action.

The fastest way to get started with Taskless is to follow a guide for your JavaScript framework. Each guide comes with an integration example from the [Taskless repository](https://github.com/taskless/taskless/tree/main/examples).

- **Next.js** [Guide](./get-started/nextjs.md) | [Example](https://github.com/taskless/taskless/tree/main/examples/next)
- **Express** [Guide](./get-started/express.md) | [Example](https://github.com/taskless/taskless/tree/main/examples/express)
- **Taskless Queue** [Guide](./get-started/raw-queue.md) (for integrations not covered above)

Jobs in Taskless generally take on two forms.

- **Evented Jobs** ([read more](./concepts/jobs.md#eventedjobs)) that are in response to a user action or external triggering event, and
- **Scheduled Jobs** ([read more](./concepts/jobs.md#scheduledjobs)) that are planned for a time in the future and may also recur

All Taskless Jobs share the same common API, with the difference being the existence of `runAt` and `runEvery` in the options to denote a job that is scheduled to run at a specific time and/or with a specific recurrence. Scheduled and Evented jobs are both available on the main Taskless site at Taskless.io.

> :information_source: To provide consistency, all examples are written in Typescript

## Getting Help

Questions? We're happy to help. Join the [Taskless Community](https://github.com/taskless/taskless/discussions/categories/q-a) on Github.
