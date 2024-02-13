# Contributing to UCC UI Library

## Overview

This project includes a UI framework that dynamically renders UI components based on the provided `globalConfig.json`.

## Getting Started

1. Clone the repo.
2. Install yarn (>= 1.2) if you haven't already: `npm install --global yarn`.
3. Run the setup task: `yarn run setup`.

After completing these steps, the following tasks will be available:

* `yarn build` – Creates a production bundle.
* `yarn start` – Builds bundle and watches for changes.
* `yarn run storybook` - Starts Storybook and opens http://localhost:6006.
* `yarn run test-storybook` - Checks if screenshots match for every story.
* `yarn run test-storybook:update-snapshots` - Updates screenshots. Must be run after every visual change.
* `yarn run eslint` – Runs linters.
* `yarn run eslint:fix` – Fixes linter issues and runs prettier.
* `yarn run format` – Runs prettier to auto-format `*.js`, `*.jsx`, and `*.css` files. This command overwrites files without confirmation. Use `format:verify` for a non-destructive check.

Running `yarn run setup` is required to enable all other tasks. This command might take a few minutes to complete.

We have published Storybook at: https://splunk.github.io/addonfactory-ucc-generator/storybook

## Code Formatting

UCC UI Lib uses [prettier](https://github.com/prettier/prettier) for consistent code formatting. It's recommended to [add a prettier plugin to your editor/IDE](https://github.com/prettier/prettier#editor-integration).

## Screenshot Testing

The repository contains screenshots of every Storybook story, stored using [Git Large File Storage](https://git-lfs.com/). Install for your system and run `git lfs install` after installation.

A [CI job from storybook-visual.yml](../.github/workflows/storybook-visual.yml) runs Storybook, takes screenshots, and compares them with the stored version. If there's a significant difference (`failureThreshold`) the job pushes an updated screenshots.

The app appears differently on MacOS and Linux in terms of text rendering. To mitigate this:
- Firefox is used for taking screenshots, as seen in the `test-storybook` command in [package.json](./package.json).
- Tuned thresholds are defined in [test-runner.ts](.storybook/test-runner.ts). Increase this threshold if a story contains a lot of text.
