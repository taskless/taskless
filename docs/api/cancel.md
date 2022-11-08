---
title: Cancelling Jobs
---

# {% $frontmatter.title %}

The `cancel()` method is the primary way to tell Taskless to not run a job. The job and its history will be retained, but no execution will occur. The general format of a cancel call is:

```ts
import MyQueue from "your/queue/location";

await MyQueue.cancel("identifier");
```

## Job Identifiers

Jobs in Taskless are identified by their `name` property. Names are considered unique to the queue and are case & space sensitive.
