# @taskless/client

A type-safe client for [Taskless.io](https://taskless.io)

# Documentation

[View the full Taskless.io Documentation](https://taskless.io/docs/), including the documentation for this module.

# Installation

This module is installable with yarn, npm, and pnpm:

```
# npm
npm install @taskless/client

# yarn
yarn add @taskless/client

# pnpm
pnpm add @taskless/client
```

# Contributing

## `node` vs `node12` and `.js` extensions

As an ESM + cjs module, we want to eventually enable the `node12` flag in our `tsconfig.json` for ESM builds. Until that time, we must manually verify all relative paths include a `.js` extension unless they are explicitly importing types. The issue is [tracked on Typescript's repository](https://github.com/microsoft/TypeScript/issues/46452) as well as a proposal to require [`.ts extensions`](https://github.com/microsoft/TypeScript/issues/37582)

# Notes

- Madge Ignore: https://github.com/pahen/madge/issues/306
