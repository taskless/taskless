#!/usr/bin/env node

import yargs from "yargs";
import { execaCommand } from "execa";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root = path.dirname(__dirname);

const argv = yargs(process.argv.slice(2))
  .scriptName("taskless")
  .usage(`$0 [-p PORT] [-d LEVEL]`)
  .alias("p", "port")
  .describe("p", "The port to start the taskless server on")
  .default("p", 3001)
  .alias("d", "debug")
  .describe("d", "Set the minimum debug level (debug => info => warn => error)")
  .default("d", "info")
  .help("h")
  .alias("h", "help").argv;

if (argv.d !== "info") {
  console.log(
    `${chalk.blue("info").padEnd(6, " ")} - Console debug level set to: ${
      argv.d
    }`
  );
}

// by running this through execa, we can switch back to commonjs
// since that is what next.js needs
execaCommand(`node server/start.js`, {
  cwd: __root,
  env: {
    // next.js in production, taskless in dev
    NODE_ENV: "production",
    TASKLESS_ENV: "development",
    TASKLESS_DEV_DEBUG: argv.d,
    TASKLESS_DEV_HOSTNAME: "0.0.0.0",
    TASKLESS_DEV_PORT: argv.p,
  },
  stdio: "inherit",
}).catch((e) => {
  console.error(e);
});
