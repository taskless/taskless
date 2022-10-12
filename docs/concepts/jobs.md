---
title: Jobs in Taskless
---

# {% $frontmatter.title %}

Jobs in Taskless are built on top of [webhooks](https://en.wikipedia.org/wiki/Webhook), programming callbacks that use URLs for their communication. When you create a Job, you ask Taskless to call your webhook some number of seconds in the future. At its core, Taskless Jobs contain what URL to call, when to call it, and some metadata that makes it easier to search for a given Job on taskless.io and on the Development Server.

# Creating a Job

Across all integrations and the core client, jobs in Taskless are created via the `enqueue()` method

# Job Identifiers

Jobs in Taskless are identified by their `name` property. Internally, we convert this to a `v5` uuid, namespaced to the owning Application's ID. Names are considered unique to the application and are case & space sensitive.

Once created, you cannot change the name of an existing job. Sending a Job to Taskless with a new name will create a new Job. In most circumstances, this is perfectly ok, as the job history for the prior job is still maintained, just under the old `name` property.
