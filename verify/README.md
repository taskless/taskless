# About These Verifiers

Shipping a dual ESM/CJS module is tricky. Requiring an ESM only module from within CommonJS produces an `ERR_REQUIRE_ESM` unless its handled by a bundler that treats `node_modules` as compilable code. Ideally, everyone would just use ESM and we'd be in great shape; reality has more nuance though. To handle these use cases, we wrote a set of **verifiers**. Code that simulates an ESM `import` and a CJS `require` of the Taskless modules. While not perfect, these will catch any top-level imports of esm-only modules before they're shipped in the production code base.
