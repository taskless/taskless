# Contributing to the Taskless Libraries

- [🗺 Repository Layout](#-repository-layout)
- [📦 Download and Setup](#-download-and-setup)
- [⏱ Testing Your Changes](#-testing-your-changes)
  - [✅ Unit Testing](#-unit-testing)
  - [🏁 E2E Testing](#-e2e-testing)
- [📚 Updating Documentation](#-updating-documentation)
- [📝 Writing a Commit Message](#-writing-a-commit-message)
- [🔎 Before Submitting](#-before-submitting)

Thanks for the help! We currently review PRs for `packages/`, `docs/`, `examples/`, and markdown files.

The Taskless client for JavaScript is easy to test and contribute compared to other languages, and we welcome all contributions to it. This file is designed to help you find your way around.

## 🗺 Repository Layout

The Taskless repository has the bulk of its code in the `packages` directory, where every folder reprents a 1:1 package released on npm under the `@taskless/*` namespace.

In the root of the repository, we have a few common files that affect nearly every package. Some (eslint, prettier) affect formatting, while others (tsconfig) affect build scripts. If you're inside of a package and see it extending `../../something`, it's relying on the common config.

## 📦 Download and Setup

> 💽 The development environment for this repository does not support Windows. To contribute from Windows you must use WSL.

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device. (`git remote add upstream git@github.com:taskless/taskless.git` 😉). You can use `git clone --depth 1 --single-branch --branch main git@github.com:taskless/taskless.git`, discarding most of branches and history to clone it faster.
2. Ensure at least [Node 14](https://nodejs.org/) is installed on your computer. (Check version with `node -v`). We have [Volta](https://volta.sh) defined on the root package.json to help out.
3. Install the dependencies using yarn with `yarn install`

> If this didn't work for you as described, please [open an issue.](https://github.com/taskless/taskless/issues/new/choose)

This project makes use of `unbuild` and `jiti` to remove the pain associated with CommonJS/ESM imports. Running `yarn dev` in the root will automatically shim all libraries. You can then start the Taskless Dev server with `yarn dev:next`, or `yarn dev:express` which will both take care of starting the Taskless Dev Server (and respective example app) for you.

## 📚 Updating Documentation

Our docs are made with [Next.js](https://github.com/vercel/next.js), built as part of the main Taskless.io website. They're located here in the `docs/` directory as Markdown files, and are deployed regularly.

## 📝 Writing a Commit Message

> If this is your first time committing to a large public repo, you could look through this neat tutorial: ["How to Write a Git Commit Message"](https://chris.beams.io/posts/git-commit/)

For consistency, this repository uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), making it easier to identify what changed, its impact, and if is a breaking change. You can see our supported [types](./commitlint.config.js), though the majority of changes are likely to be `feat`, `fix`, or `docs`.

## 🔎 Before Submitting

To help land your contribution, please make sure of the following:

- Remember to be concise in your Conventional Commit
- If your change is a `fix`, `feat`, or breaking change, you must update the `CHANGELOG.md` file. We curate this manually for now.
- If you modified anything in `packages/`:
  - You verified the transpiled TypeScript with `yarn build` in the directory of whichever package you modified.
  - Run `yarn test` to ensure all existing tests pass for that package, along with any new tests you would've written.

## Additional Notes: Testing Against Production

> This is more for the Taskless team, though you're welcome to bypass the Taskless Dev Server too!

1. Create a `.env.local` in `examples/next` with `TASKLESS_ENV=production`, `TASKLESS_BASE_URL=https://webhook.site/<your-url>`, `TASKLESS_ID=<taskless-id>`, and `TASKLESS_SECRET=<your-secret>`.
2. Start the next example app. You'll be able to queue a message from `http://localhost:3000/api/production`, and receive it by performing an XHR forward from webhook.site.
