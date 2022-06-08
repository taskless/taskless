const base = require("../../.lintstagedrc.cjs");

module.exports = {
  ...base,
  "**/*.ts?(x)": ["eslint", "madge --circular", "prettier --write"],
};
