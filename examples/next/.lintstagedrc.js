// https://nextjs.org/docs/basic-features/eslint#lint-staged
import path from "node:path";
import base from "../../.lintstagedrc.cjs";

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(" --file ")}`;

export default {
  ...base,
  "*.{js,jsx,ts,tsx}": [buildEslintCommand, "prettier --write"],
};
