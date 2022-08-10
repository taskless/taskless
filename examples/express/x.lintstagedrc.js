module.exports = {
  "**/*.js?(x)": ["eslint", "madge --circular", "prettier --write"],
};
