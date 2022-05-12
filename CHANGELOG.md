Packages in this repository are synchronized on release, with a single changelog across all pacakges. This changelog is specifically limited to items in the `packages/` folder.

# 2.0.0 (upcoming)

#### 💥 BREAKING CHANGES

- **@taskless/client** Dropped support for Node 12, as it is no longer supported in LTS. It's recommended to use node 14 or 16 at this time.
- **@taskless/client** ESM Only Module. As of 2.0.0, Taskless is ESM only. Node 14 (now LTS until 2023) [recommends a switch from CJS+ESM to ESM only as a major version bump](https://nodejs.org/dist./v14.10.0/docs/api/esm.html#esm_writing_dual_packages_while_avoiding_or_minimizing_hazards). With the backwards-incompatible removal of Node 12 support, this felt like the ideal time to make this change.

#### 🎉Features

- **@taskless/client** Added the ability to specify an array as a job identifier instead of just a string key, making namespacing identifiers require less cognitive overhead
- **@taskless/client** (express) Added a `mount` method for working with Taskless when it's attached to a sub-router.
- **@taskless/dev** Added the ability to create jobs via the Taskless dev dashboard

#### 🔧 Fixes

- **@taskless/client** Fixed default export of `Queue` in CJS environments
- **@taskless/client** Fixed issue in development where a mismatched signature would throw instead of logging an error

#### 🎒 Misc

- **@taskless/dev** Switched PouchDB for [mongo-memory-server](https://www.npmjs.com/package/mongodb-memory-server). While it adds a bit more overhead to start up a Mongo server in development, it makes it much easier to use Mango queries for querying task and job information.
- **@taskless/client** Switched to `type` imports wherever possible. While it doesn't offer direct improvements, this matches the Typescript recommendation.
- **@taskless/client** Updated node specific modules to import from the `node:` namespace
- **@taskless/client** Moved to home in `/packages` matching its package name to reduce confusion
- **@taskless/root** Added a `dev` script that gets every integration up and running in dev mode for fast debugging

# 1.1.0 - released May 2, 2022

#### 🎉Features

- **@taskless/dev** New devlopment server pages at `/` and `/logs` to mirror Taskless.io, replacing the old completed/scheduled structure
- **@taskless/dev** Common UI components. Imported Taskless' DataTable, Logo, and Slash components

# 1.0.0 - released April 25, 2022

Initial 1.0 release of @taskless/client and @taskless/dev
