const path = require("path");

const common = ["prettier --write"];

module.exports = {
  // global configurations, these are always cleaned
  "*.{json,gql,graphql,md,yaml,yml}": [...common],

  // next.js
  [`{examples/next/*,examples/next/**/*}.{js,ts,jsx,tsx,vue}`]: [
    ...common,
    // https://nextjs.org/docs/basic-features/eslint#lint-staged
    ...[
      (filenames) =>
        `yarn workspace taskless-example-next lint --fix --file ${filenames
          .map((f) => path.relative(process.cwd(), f))
          .join(" --file ")}`,
    ],
  ],

  // taskless
  [`{packages/taskless/*, packages/taskless/**/*}.{js,ts,jsx,tsx,vue}`]: [
    ...common,
    "yarn workspace @taskless/client lint --fix",
  ],
};
