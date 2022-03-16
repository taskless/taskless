# Contributing to the Taskless Libraries

- [📦 Download and Setup](#-download-and-setup)
- [⏱ Testing Your Changes](#-testing-your-changes)
  - [✅ Unit Testing](#-unit-testing)
  - [🏁 E2E Testing](#-e2e-testing)
- [📚 Updating Documentation](#-updating-documentation)
- [📝 Writing a Commit Message](#-writing-a-commit-message)
- [🔎 Before Submitting](#-before-submitting)

Thanks for the help! We currently review PRs for `packages/`, `docs/`, `examples/`, and markdown files.

The Taskless client for JavaScript is easy to test and contribute compared to other languages, and we welcome all contributions to it.

> 💡 Why GraphQL?
>
> The simplest answer is that by basing our clients on GraphQL, we can provide a consistent and testable schema for integrations. Anything you can do with a Taskless client, you should be able to also do with direct GraphQL calls. Taskless clients should instead offer additional features that make it easier to integrate with existing frameworks, offer type-safe methods, and more.

## 📦 Download and Setup

> 💽 The development environment for this repository does not support Windows. To contribute from Windows you must use WSL.

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device. (`git remote add upstream git@github.com:taskless/taskless.git` 😉). You can use `git clone --depth 1 --single-branch --branch main git@github.com:taskless/taskless.git`, discarding most of branches and history to clone it faster.
2. Ensure [Node 14](https://nodejs.org/) is installed on your computer. (Check version with `node -v`)
3. Install the dependencies using yarn with `yarn install`

> If this didn't work for you as described, please [open an issue.](https://github.com/taskless/taskless/issues/new/choose)

## 📚 Updating Documentation

Our docs are made with [Next.js](https://github.com/vercel/next.js), built as part of the main Taskless.io website. They're located here in the `docs/` directory as Markdown files, and are deployed regularly.

If you see a typo in our TypeScript documentation, you'll want to change the source TypeScript file. These files can be found via the **Defined in** section.

## 📝 Writing a Commit Message

> If this is your first time committing to a large public repo, you could look through this neat tutorial: ["How to Write a Git Commit Message"](https://chris.beams.io/posts/git-commit/)

For consistency, this repository uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), making it easier to identify what changed, its impact, and if is a breaking change. You can see our supported [types](./commitlint.config.js), though the majority of changes are likely to be `feat`, `fix`, or `docs`.

## 🔎 Before Submitting

To help land your contribution, please make sure of the following:

- Remember to be concise in your Conventional Commit. These will enventually be automatically rolled up into an auto-generated CHANGELOG file
- If you modified anything in `packages/`:
  - You transpiled the TypeScript with `yarn build` in the directory of whichever package you modified.
  - Run `yarn lint --fix .` to fix the formatting of the code. Ensure that `yarn lint` succeeds without errors or warnings.
  - Run `yarn test` to ensure all existing tests pass for that package, along with any new tests you would've written.
