// https://nextjs.org/docs/basic-features/eslint#lint-staged
const path = require("path");
const base = require("../../.lintstagedrc.cjs");

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(" --file ")}`;

module.exports = {
  ...base,
  "*.{js,jsx,ts,tsx}": [buildEslintCommand, "prettier --write"],
};
