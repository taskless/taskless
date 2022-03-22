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
  .describe("d", "Set the minimum debug level (info => warn => error)")
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

execaCommand(`npx next start --hostname 0.0.0.0 -p ${argv.p}`, {
  cwd: __root,
  env: {
    TASKLESS_DEV_DEBUG: argv.d,
  },
  stdio: "inherit",
}).catch((e) => {
  console.error(e);
});
