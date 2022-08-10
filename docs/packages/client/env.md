# Taskless Environment Variables

Most options in Taskless can be represented via [Environment Variables](https://en.wikipedia.org/wiki/Environment_variable) or colloquially "env" values. Env values are not committed to your repository and often contain sensitive information such as secrets. Most deployment targets including Vercel, Heroku, and Netlify all allow you to specify env values as part of your app's configuration.

Taskless recommends storing the bulk of your configuration in env values.

- `TASKLESS_ID` (example: `abcdef...000001`) Your project's unique ID from Taskless.io
- `TASKLESS_SECRET` (example: `xgt1_aBCd612...`) Your project's secret token from Taskless.io
- `TASKLESS_BASE_URL` (example: `http://localhost:1234`) Defines the protocol, domain, and port for your application
- `TASKLESS_ENCRYPTION_KEY` (example: `alonguniquestring...`) Your encryption key for end-to-end encryption
- `TASKLESS_PREVIOUS_SECRETS` (example: `xgt1_abc,xgt1_def`) Previous application secrets, comma separated
- `TASKLESS_PREVIOUS_ENCRYPTION_KEYS` (example: `key1,key2...`) Previous encryption keys, comma separated
- `TASKLESS_ENV` (example: `development`) Used to override the NODE_ENV value, specifically for Taskless

> Note: In Taskless@2.x.x, the environment variables `TASKLESS_APP_SECRET` and `TASKLESS_PREVIOUS_APP_SECRETS` were used to refer to the per-queue secret. This was removed in v3 in favor of a project-level ID & Secret.

**Development ENV Values** Additionally, the following env values may be useful in development.

- `TASKLESS_DEV_ENDPOINT` (example: `http://localhost:8080/api/graphql`) Changes the GraphQL endpoint used for the Taskless dev server if the default port or path cannot be used
