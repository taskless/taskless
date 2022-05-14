/* eslint-disable */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    extraFileExtensions: [".cjs"],
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json", "./packages/*/tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
  ],
};
