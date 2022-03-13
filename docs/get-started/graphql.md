# Getting Started With Taskless and GraphQL

Taskless comes with a fully accessible GraphQL Endpoint at `for.taskless.io/api/graphql`. It supports introspection, and we encourage the use of code generation tools such as [graphql-code-generator](https://www.graphql-code-generator.com/) to create type-safe APIs. The current SDL can also be downloaded directly from [https://for.taskless.io/schema.graphql](https://for.taskless.io/schema.graphql).

The Taskless client utilizes this same Schema in order to ensure type safety when executing queue operations.

## Authentication

Authentication for the GraphQL requires two headers to be passed along with every request:

1. `x-taskless-app-id` is your Application ID, available in your Taskless Dashboard
2. `x-taskless-secret` is your Application Secret, available in your Taskless Dashboard

If you send a request without one or both of these headers, your query will automatically be scoped to unauthorized endpoints. If you provide an incorrect secret for your application, you'll receive a `401` of `Invalid Credentials`.

## Common Operations

These example operations come directly from the Taskless Client

- [enqueue, update, and delete mutations](https://github.com/taskless/taskless/blob/e971500855c87832c25dcebf04f741bdc9eb5f58/packages/taskless/src/graphql/job.graphql#L13-L29)
- [fetch query for a job](https://github.com/taskless/taskless/blob/e971500855c87832c25dcebf04f741bdc9eb5f58/packages/taskless/src/graphql/job.graphql#L31-L35)
