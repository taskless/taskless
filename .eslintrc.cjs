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
  rules: {
    // https://github.com/typescript-eslint/typescript-eslint/issues/2728
    "@typescript-eslint/no-unsafe-member-access": "off",
  },
};
