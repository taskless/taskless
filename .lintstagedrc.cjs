module.exports = {
  "*.(md|json|graphql)": "prettier --write",
  "package.json": [
    () => "syncpack list-mismatches",
    () => "syncpack format",
    "prettier --write",
  ],
  "packages/**/package.json": [() => "syncpack format", "prettier --write"],

  ...["client", "dev", "express", "graphinql", "next", "types", "ui"].reduce(
    (actions, package) => {
      actions[`packages/${package}/**/*.{cjs,mjs,js,jsx,ts,tsx}`] = [
        "eslint --fix",
        () => `tsc --project ./packages/${package}/tsconfig.json --noEmit`,
        "prettier --write",
      ];
      return actions;
    },
    {}
  ),
};
