<!-- Banner -->
<p align="center">
  <a href="https://taskless.io">
    <img alt="taskless logo" height="128" src="https://raw.githubusercontent.com/taskless/taskless/main/.github/resources/taskless.png">
    <h1 align="center">Taskless</h1>
  </a>
</p>

<!-- Docs -->
<p align="center">
  <a aria-label="taskless documentation" href="https://taskless.io/docs">Read the Documentation 📚</a>
</p>

---

# @taskless/dev

A local development server for Taskless.io. Using a local development server saves on roundtrips to Taskless.io and also allows you to inspect, invoke, and manage your job queues. Uses an in-memory database under the hood.

# Getting Started

First, install this package via npm/yarn/pnpm into your development dependencies

```bash
npm i -d @taskless/dev
# or
yarn add -D @taskless/dev
# or
pnpm add -D @taskless/dev
```

Then, add the Taskless binary to your development script. We recommend either [concurrently](https://www.npmjs.com/package/concurrently) or [npm-run-all](https://www.npmjs.com/package/npm-run-all) depending on how your app is configured. For example, if you are using a next.js app, your package.json's `dev` script might look like:

```json
{
  "scripts": {
    "dev": "concurrently -n taskless,next 'taskless' 'next dev'"
  }
}
```

This will start the Taskless development server alongside your app. Unless explicitly configured, @taskless/client and integrations will always communicate with the Taskless dev server so that you're not interfering with production traffic.

The development server's UI is reachable on `http://localhost:3001`.

# Advanced

## Changing the Port

The development port can be changed by passing the `-p [PORT]` flag to the `taskless` command. If you change this, you'll need to set the `TASKLESS_ENDPOINT` env value in your app, otherwise the Taskless Client won't be able to find your development server.
