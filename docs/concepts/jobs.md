# Jobs in Taskless

Jobs in Taskless are built on top of [webhooks](https://en.wikipedia.org/wiki/Webhook), programming callbacks that use URLs for their communication. When you create a Job, you ask Taskless to call your webhook some number of seconds in the future. At its core, Taskless Jobs contain what URL to call, when to call it, and some metadata that makes it easier to search for a given Job on taskless.io and on the Development Server.

# Creating a Job

Across all integrations and the core client, jobs in Taskless are created via the `enqueue()` method

# Job Identifiers
