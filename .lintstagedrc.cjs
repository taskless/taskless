module.exports = {
  "*.(md|json)": "prettier --write",
  "package.json": [
    () => "syncpack list-mismatches",
    () => "syncpack format",
    "prettier --write",
  ],
};
