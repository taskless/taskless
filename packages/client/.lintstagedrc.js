export default {
  "*.(md|json)": "prettier --write",
  "**/*.ts?(x)": ["eslint", "madge --circular", "prettier --write"],
};
