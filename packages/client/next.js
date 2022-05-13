// --- Legacy Root File
// The purpose of this file is to allow for seamless importing of
// subdirectory-style imports such as @taskless/client/foo. For this to work,
// any code running in legacy node.js expects to find "foo.js" here in the
// root. We then export directly the contents of the dist/esm/* file. Because
// there is a package.json inside of dist/esm that forces the type to module,
// we are gain the benefits of running as a pure ESM module, while still
// offering the expected imports.

export * from "./dist/esm/integrations/next.js";
