/* eslint-disable */

/*
About Legacy CommonJS Support
During build, this file is placed into /dist/cjs/index.js
It uses the fix-esm library (https://www.npmjs.com/package/fix-esm) to perform
a lightweight transpilation if a module is encountered in the require() chain
that is ESM-only. This introduces a small performance hit on initial load, but
the solution is to move to ESM syntax at the earliest convienence.
*/

module.exports = require("fix-esm").require("../esm/index.js");
