const path = require("path");

// create a Lint Staged file sequence to check all matching files of JS in a directory
const jsIn = (at) => `{${at}/*,${at}/**/*}.{js,ts,jsx,tsx,vue}`;

// create an xargs-like function that lets us ran 100s of files into the arguments part of a command
const xargs = (list) => (command, xarg) =>
  command +
  (xarg ? ` ${xarg} ` : " ") +
  list
    .map((f) => path.resolve(process.cwd(), f))
    .join(xarg ? ` ${xarg} ` : " ");

module.exports = {
  // // global configurations, these are always cleaned
  // "*.{json,gql,graphql,md,yaml,yml}": ["prettier --write"],
  // [jsIn("examples/next")]: [
  //   (f) =>
  //     xargs(f)("yarn workspace taskless-example-next lint --fix", "--file"),
  //   "prettier --write",
  // ],
  // // taskless client
  // [jsIn("packages/client")]: [
  //   (f) =>
  //     xargs(f)(
  //       `yarn workspace @taskless/client eslint --fix --plugin tsc --rule 'tsc/config: [2, {configFile: \"./tsconfig.json\"}]'`
  //     ),
  //   `yarn workspace @taskless/client madge --no-spinner --circular`,
  //   "prettier --write",
  // ],
  // // taskless dev server
  // [jsIn("packages/dev")]: [
  //   (f) =>
  //     xargs(f)("yarn workspace taskless-example-next lint --fix", "--file"),
  //   `yarn workspace @taskless/dev madge --no-spinner --circular`,
  //   "prettier --write",
  // ],
};
