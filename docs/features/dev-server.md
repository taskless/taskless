---
title: The Taskless Dev Server
---

# {% $frontmatter.title %}

The Taskless Dev Server **(TDS)** is a dev dependency that lets you run a local Taskless instance for development and testing without making calls to Taskless.io. As much as possible, we work to ensure TDS has the same feature set as the main Taskless site, simplified down to a node.js-friendly module.

## Installation

Install `@taskless/dev` into your development dependencies via your JS package manager of choice.

```sh
# npm
npm install --save-dev @taskless/dev
# yarn
yarn add -D @taskless/dev
# pnpm
pnpm add -D @taskless/dev
```

To run TDS alongside your code, it makes sense to add a concurrency library such as [npm-run-all](https://www.npmjs.com/package/npm-run-all) with the `-p` flag, or [concurrently](https://www.npmjs.com/package/concurrently). The end result is a package.json scripts section that might look like this:

```json
{
  "scripts": {
    "...": "...",
    "dev": "concurrently -n taskless,next taskless 'node ./index.js'"
  }
}
```

When TDS starts, it is available at `http://localhost:3001`

## Options

| Flag            | Example         | Description                                                                                                                                                                                                                            |
| :-------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-p`, `--port`  | `--port=3000`   | Change the port TDS runs on away from the default port of `3001`. Updating this value means you should also set your `TASKLESS_DEV_ENDPOINT` variable to `http://localhost:<PORT>/api/rpc` so that Taskless knows where TDS is located |
| `-d`, `--debug` | `--debug=error` | Change the logging threshold for TDS from the default of `info`. From quietest to noisiest: `error` => `warn` => `info` => `debug`                                                                                                     |
