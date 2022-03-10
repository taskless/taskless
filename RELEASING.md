# Releasing using `release-it`

This repository releases code using [release-it](https://github.com/release-it/release-it) in combination with the [yarn workspaces plugin](https://github.com/rwjblue/release-it-yarn-workspaces). New releases can be triggered from the root package via `yarn release` which offers a guided process.

## Common Commands

- Begin a new for the next version `next` with `yarn release <major|minor|patch> --preRelease=next`
- Continue an existing `major`, `minor`, or `patch` pre release with `yarn release --preRelease`
- Change the pre release tag with a new `--preRelease=` flag
- Ultimately release with `yarn release <major|minor|patch>`
