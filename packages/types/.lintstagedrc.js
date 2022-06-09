import base from "../../.lintstagedrc.cjs";

export default {
  ...base,
  "**/*.ts?(x)": ["eslint", "madge --circular", "prettier --write"],
};
