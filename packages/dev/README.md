# @taskless/dev

A local development server for Taskless.io. Using a local development server saves on roundtrips to Taskless.io and also allows you to inspect, invoke, and manage your job queues. Under the hood, it uses PouchDB for a simple in-memory database while managing responses similar to the `for.taskless.io` service.

# Getting Started

First, install this package via npm or yarn into your development dependencies

```bash
npm i -d @taskless/dev
# or
yarn add -D @taskless/dev
```

Then, add the Taskless binary and the environment variable `TASKLESS_DEV=1` to your development script. We recommend either [concurrently](https://www.npmjs.com/package/concurrently) or [npm-run-all](https://www.npmjs.com/package/npm-run-all) depending on how your app is configured. For example, if you are using a next.js app, your package.json's `dev` script might look like:

```json
{
  "scripts": {
    "dev": "TASKLESS_DEV=1 concurrently 'taskless' 'next dev'"
  }
}
```

This will start the Taskless development server alongside your app and tell your Taskless Client to switch to local development. By default, the development server's UI is reachable on `http://localhost:3001`.

# Advanced

## Changing the Port

The development port can be changed by passing the `-p [PORT]` flag to the `taskless` command. If you change this, you'll need to set the `TASKLESS_ENDPOINT` env value in your app, otherwise the Taskless Client won't be able to find your development server.
