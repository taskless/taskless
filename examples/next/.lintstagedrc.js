// https://nextjs.org/docs/basic-features/eslint#lint-staged
import path from "node:path";

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(" --file ")}`;

export default {
  "*.{js,jsx,ts,tsx}": [buildEslintCommand, "prettier --write"],
};
