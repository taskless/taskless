const base = require("../../.lintstagedrc.cjs");

module.exports = {
  ...base,
  "**/*.js?(x)": ["eslint", "madge --circular", "prettier --write"],
};
