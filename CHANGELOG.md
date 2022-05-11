Packages in @taskless are synchronized, with a single changelog across all pacakges. This changelog is specifically limited to items in the `packages/` folder which maps to our published packages.

# next (tentative 1.2.0)

#### 🎉Features

- **@taskless/dev** Added the ability to create jobs via the Taskless dev dashboard

#### 🔧 Fixes

- **@taskless/client** Fixed default export of `Queue` in CJS environments

#### 🎒 Misc

- **@taskless/dev** Switches PouchDB for [mongo-memory-server](https://www.npmjs.com/package/mongodb-memory-server). While it adds a bit more overhead to start up a Mongo server in development, it makes it much easier to use Mango queries for querying task and job information.

# 1.1.0 - released May 2, 2022

#### 🎉Features

- **@taskless/dev** New devlopment server pages at `/` and `/logs` to mirror Taskless.io, replacing the old completed/scheduled structure
- **@taskless/dev** Common UI components. Imported Taskless' DataTable, Logo, and Slash components

# 1.0.0 - released April 25, 2022

Initial 1.0 release of @taskless/client and @taskless/dev
