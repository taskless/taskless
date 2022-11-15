---
title: Handling Jobs
---

# {% $frontmatter.title %}

Jobs are handled asynchronously, reusing the routing logic already available in your frontend framework. Before a job reaches the Handler, the Taskless integration takes care of verifying the signature and decrypting the payload. The core of a Job Handler is an asynchronous function, which receives two parameters: `job` and `meta`.

{% tabs %}

{% tab label="Using an Integration" %}

The second argument to `createQueue` is the Job Handler (or `handler` for short). It's where the bulk of your job processing occurs.

```ts
import { createQueue } from "@taskless/<integration>";

const MyQueue = createQueue(
  "example-queue",
  "/api/example-queue",
  async (job, meta) => {
    /*
    |
    | This is the Job Handler body
    |
    */
  }
);
```

{% /tab %}

{% tab label="Raw Client" %}

The Job Handler (or `handler` for short) is passed into the Queue class' `options` parameter.

```ts
import { Queue } from "@taskless/client";

const MyQueue = new Queue({
  name: "example-queue",
  route: "/example-queue",
  handler: (job, meta) => {
    /*
    |
    | This is the Job Handler body
    |
    */
  },
});
```

{% /tab %}

{% /tabs %}

## Job Handler Arguments

`job: T` \
This is your job object. If you are using typescript and defined your queue payload of type `T`, it will be reflected here in the handler.

`meta` \
The Job Metadata. Contains several useful properties about the job, as well as a recursive reference to the Queue object for type safety.

`meta.queueName` \
The name of the queue in use for the job.

`meta.jobName` \
The Job Identifier used in scheduling this job.

`meta.projectId` \
The ID for the Project associated with this queue.

`meta.queue` \
Contains a reference to the Taskless Queue (`Queue<T>`), containing the standard set of Taskless queue methods: `enqueue`, `cancel`, and `bulk`
