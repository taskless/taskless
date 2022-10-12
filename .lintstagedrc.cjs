module.exports = {
  "*.(md|json|graphql)": "prettier --write",
  "./package.json": [
    () => "syncpack list-mismatches",
    () => "syncpack format",
    "prettier --write",
  ],
  "packages/**/package.json": [() => "syncpack format", "prettier --write"],

  ...[
    "docs-site",
    "packages/client",
    "packages/dev",
    "packages/express",
    "packages/graphinql",
    "packages/next",
    "packages/types",
    "packages/ui",
  ].reduce((actions, pkg) => {
    actions[`${pkg}/**/*.{cjs,mjs,js,jsx,ts,tsx}`] = [
      "eslint --fix",
      () => `tsc --project ./${pkg}/tsconfig.json --noEmit`,
      "prettier --write",
    ];
    return actions;
  }, {}),
};
