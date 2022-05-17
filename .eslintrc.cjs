/* eslint-disable */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    extraFileExtensions: [".cjs"],
    tsconfigRootDir: __dirname,
    project: [
      "./tsconfig.json",
      "./examples/*/tsconfig.json",
      "./packages/*/tsconfig.json",
    ],
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
  ],
  rules: {
    // False positives. There be dragons here. Most common culprits are
    // optional chaining and nullish coalesce.
    // example: @ packages/client/queue/queue.ts
    // this.queueOptions.baseUrl is of type (string | undefined)
    // Using it in any context causes typescript-eslint to believe it is
    // of type "any" and trigger these eslint errors.
    // https://github.com/typescript-eslint/typescript-eslint/issues/2728
    // https://github.com/typescript-eslint/typescript-eslint/issues/4912
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
  },
};
