# createQueue

```ts
import { createQueue } from "@taskless/client/<integration>";

type Job = {
  /* typeof job */
};

export default createQueue<Job>(
  path as string,
  async function callback(job: Job, meta) {},
  config as QueueOptions
);
```

- `path` Combined with the Base URL, this path resolves to a publicly accessible URL for your queue. In most cases, this is the part after your `.com` or `.io` such as `/api/queues/myQueueName`
- `callback` A promise-returning function that will receive the job payload and metadata as arguments.
- `config` A set of [`QueueOptions`](/docs/api/queue.md#queue-options) for this queue. You can use the config to set defaults for every job in the queue, override default environment values, or (if required by your integration) pass additional information into the queue generator

Calling `createQueue` will return a Queue interface with, at a minimum, the following methods:

- `.enqueue(name, payload, options)` Insert a new item into the queue with an identifier `name`, the specified `payload`, and using the provided `options`. Returns the created Job.
- `.update(name, payload?, options?)` Update an existing item in the queue with identifier `name` with an optional `payload` and optional `options`. If the job does not exist in Taskless, this will throw an error. Returns the updated Job.
- `.delete(name)` Delete a Job in Taskless with the identifier `name`. Returns the deleted Job, or `null` if no Job was deleted.
- `.get(name)` Get a Job in Taskless with the identifier `name`. Returns `null` if no Job was found.
- Additional methods or properties may be exposed for your integration, but all integrations have the above at a minimum.

## Related

- [Queue](/docs/api/queue.md) Queue Methods and Creation Options
