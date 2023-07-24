module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-empty": [0, "always"],
    "type-enum": [
      1,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "release",
        "perf",
        "test",
        "deps",
        "chore",
        "wip",
      ],
    ],
    "subject-case": [2, "always", "sentence-case"],
    "signed-off-by": [0, "always"],
    "footer-max-line-length": [1, "always", 100],
  },
  parserPreset: {
    parserOpts: {
      noteKeywords: ["\\[[^\\]]+]:"],
    },
  },
};
