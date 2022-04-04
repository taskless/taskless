# The Taskless Dev Server

To avoid making roundtrips to Taskless.io during development and avoid using production quota for testing, we recommend using the Taskless Dev Server in non-production environments.

Taskless Dev Server (TDS) is an in-memory replica of the Taskless infrastructure

- Allows you to verify queues, operations, endpoints, and encryption
- Provides a local dashboard to view completed jobs, promote pending jobs, and inspect payloads

TDS' low memory footprint makes it ideal for testing in environments where your app runs on `localhost`.

## Installation

TDS can be installed via any node package manager. We're also going to use [concurrently](https://www.npmjs.com/package/concurrently) to make it easier to start multiple services.

```sh
# install the package using npm
npm install --save-dev @taskless/dev concurrently

# or install the package using yarn
yarn add -D @taskless/dev concurrently

# or install the package using pnpm
pnpm add -D @taskless/dev concurrently
```

And update your `package.json` to launch the Taskless Dev Server alongside your app in development.

```json
{
  "scripts": {
    "dev": "concurrently -n taskless,dev taskless dev:app",
    "dev:app": "<your original scripts.dev>"
  }
}
```

## Usage

When you run your `dev` command, Taskless Dev Server will now start alongside your original code. By default, `@taskless/client` will prefer the development server when `process.env.NODE_ENV !== "production"`. You can explicitly change this behavior by setting the [env value](../api/env.md) `TASKLESS_DEV_ENABLED` to either `1` (force enable) or `0` (force disable).

Additional options can be specified when launching the Taskless Dev Server, outlined below.

## Taskless Options

```
taskless [-p PORT] [-d LEVEL]

Options:
      --version  Show version number                                   [boolean]
  -p, --port     The port to start the taskless server on        [default: 3001]
  -d, --debug    Set the minimum debug level (info => warn => error)
                                                               [default: "info"]
  -h, --help     Show help                                             [boolean]
```

- `-p --port` Sometimes, `3001` is already in use by part of your stack. If you change this value when launching the Taskless Dev Server, you should also set the [env value](../api/env.md) `TASKLESS_ENDPOINT` to point to the new base URL such as `http://localhost:8080`
- `d --debug` TDS defaults to sharing more information in the console with you about job processing to help with debugging. You can lower the noise substantially by changing the debug level to `warn` or `error`
