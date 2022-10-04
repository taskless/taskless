// this is a pre-flatconfig setup
// the goal is to use overrides in a way that maps neatly to files/ignores in
// eslint 9

/**
 * Create a set of default eslint configs for a typescript project
 * @param {string} dir
 * @returns
 */
const tsProject = (dir) => ({
  plugins: ["@typescript-eslint", "import", "node"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [`${dir}/tsconfig.json`],
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: [`${dir}/tsconfig.json`],
      },
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
  ],
  rules: {
    // False positives. There be dragons here. Most common culprits are
    // optional chaining and nullish coalesce.
    // Using it causes typescript-eslint to believe it is
    // of type "any" and trigger these eslint errors. We'd like to safely
    // turn these on, and would appreciate any help in solving.
    // https://github.com/typescript-eslint/typescript-eslint/issues/2728
    // https://github.com/typescript-eslint/typescript-eslint/issues/4912
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/restrict-template-expressions": "off",

    // https://typescript-eslint.io/rules/no-unused-vars/
    // https://eslint.org/docs/rules/no-unused-vars
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { ignoreRestSiblings: true },
    ],
  },
});

/**
 * Get a list of all lintable files in a directory
 * @param {string} dir
 * @returns
 */
const lintableFiles = (dir) => [
  `${dir}/**/*.+(t|j)s?(x)`,
  `${dir}/**/*.+(c|m)js`,
];

/** A set of import rules that ensure files are imported in a way webpack and vscode both understand */
const nextJsImportRules = {
  "import/extensions": ["error", "never", { json: "always", css: "always" }],
  "node/file-extension-in-import": [
    "error",
    "never",
    { ".json": "always", ".css": "always" },
  ],
  "node/no-missing-import": "off",
};

module.exports = {
  root: true,
  rules: {},
  // baseline js parsing options set env for CJS files and skip known builds
  env: {
    es6: true,
    es2018: true,
    node: true,
  },
  ignorePatterns: [
    "**/dist/*",
    "**/build/*",
    "**/.swc/*",
    "**/.next/*",
    "**/__generated__/*",
    "**/*.config.js",
  ],

  overrides: [
    // check yourself before you wreck yourself
    {
      files: ["**/.eslintrc.cjs", ".lintstagedrc.cjs", "commitlint.config.cjs"],
      extends: ["eslint:recommended", "prettier"],
    },

    // docs-site - Doc Preview, a next.js project
    {
      files: lintableFiles("./docs-site"),
      excludedFiles: ["**/__generated__/*", "**.d.ts"],
      ...tsProject("./docs-site"),
      extends: [...tsProject("./docs-site").extends, "next"],
      settings: {
        ...tsProject("./docs-site").settings,
        next: {
          rootDir: "docs-site/",
        },
      },
      rules: {
        ...tsProject("./docs-site").rules,
        ...nextJsImportRules,
      },
    },

    // dev - Taskless Dev Server, a next.js project
    {
      files: lintableFiles("./packages/dev"),
      excludedFiles: ["**/__generated__/*", "**.d.ts"],
      ...tsProject("./packages/dev"),
      extends: [...tsProject("./packages/dev").extends, "next"],
      settings: {
        ...tsProject("./packages/dev").settings,
        next: {
          rootDir: "packages/dev/",
        },
      },
      rules: {
        ...tsProject("./packages/dev").rules,
        ...nextJsImportRules,
      },
    },

    // client, express, graphinql, next, types, ui
    ...["client", "express", "graphinql", "next", "types", "ui"].map((p) => ({
      files: lintableFiles(`./packages/${p}`),
      // excludedFiles: ["**/dist/**", "**/__generated__/*", "**/*.d.ts"],
      ...tsProject(`./packages/${p}`),
      rules: {
        ...tsProject(`./packages/${p}`).rules,
        "no-restricted-imports": [
          "error",
          {
            patterns: ["src/*"],
          },
        ],
        "node/file-extension-in-import": ["error", "always"],
      },
    })),
  ],
};
