---
title: Bulk Operations
---

# {% $frontmatter.title %}

When you have several jobs you need to schedule at once, it makes sense to do them in batches. Taskless has a Bulk Operation API accessible under `<your-queue>.bulk.*` on every integration as well as the core Taskless Client. The Taskless service allows you to send up to 100 calls in a single request; the Client will take care of splitting your request up into the maximum allowed chunk size.

## The Bulk Response

Because Bulk Operations may need to make multiple requests, a response will be a promise containing a tuple of `[successes, errors]` returned from the bulk calls. If no errors are encountered, then index `[1]` of the tuple will be `undefined`.

```ts
// <T> is the type specified when you made your Queue
type BulkOperationResult<T> = [Job<T>[], Error[] | undefined];
```

## Bulk Enqueue

Allows for enquing multiple jobs at the same time. Because `JobOptions` can differ per job, they must be specified with each individual job entry.

```ts
const [jobs, errors] = await myQueue.bulk.enqueue([
  {
    name: "job-identifier",
    payload: T,
    jobOptions: JobOptions ?? undefined,
  }, // ...
]);
```

### Using `bulk.enqueue` for a Fan-Out Operation

```ts
// schedule a jobs in bulk with the same job options
// names use the index value of the map() operation
const [jobs, errors] = await myQueue.bulk.enqueue(
  myPayloads.map((p, idx) => {
    return {
      name: `fanout-sample-${idx}`,
      payload: p,
      jobOptions: {
        retries: 3,
      },
    };
  })
);
```

### Using `bulk.enqueue` for Bulk Scheduling

```ts
// schedule jobs in bulk, using a value in the payload
// to set the Job Identifier
const [jobs, errors] = await myQueue.bulk.enqueue(myPayloads.map((p) => {
  return {
    name: ["sendTo", p.targetUserId].
    payload: p
  }
}))
```

## Bulk Cancel

Similar to `cancelJob`, but operates in bulk on an array of Job Identifiers.

```ts
const [jobs, errors] = await myQueue.bulk.cancel([jobIdentifiers]);
```
