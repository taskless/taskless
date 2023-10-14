# Changelog

All notable changes to @taskless/client, @taskless/express, @taskless/next, and @taskless/ui will be documented in this file. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking Changes

### Added

### Fixed

### Changed

- Relocation of `@taskless/graphinql` - The graphinql project is being split out into its own project as a simple typesafe GraphQL client with no dependencies on `graphql` or `graphql-tag`. It is published under the same package, but will now be located at https://github.com/taskless/graphinql and its versioning will be independent of the Taskless client libraries going forward (3.7.1)

### Removed

- Removal of `@taskless/dev` - With v4 of the Taskless client, developers can use the taskless.io architecture to test and preview jobs using their browser. Switching to the developer instance is done by changing your `TASKLESS_API_KEY` to your project's development API key.
- (graphinql) Removed `isomorphic-unfetch` from depdnencies

## Older Releases

Older releases are available via github releases: https://github.com/taskless/taskless/releases

<!-- Releases -->

[unreleased]: https://github.com/taskless/taskless/compare/3.6.2...HEAD

<!--
Template:

### Breaking Changes
### Added
### Fixed
### Changed
### Removed
-->
