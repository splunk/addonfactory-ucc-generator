# Contributing to UCC UI Library

## Overview

The project contains UI framework that renders UI components dynamically based on provided `globalConfig.json`.

## Getting Started

1. Clone the repo.
2. Install yarn (>= 1.2) if you haven't already: `npm install --global yarn`.
3. Run the setup task: `yarn run setup`.

After this step, the following tasks will be available:

* `yarn build` – Create a production bundle
* `yarn start` – build bundle and watch changes
* `yarn run storybook` - start storybook and open http://localhost:6006
* `yarn run test-storybook` - check if screenshots match for every story
* `yarn run test-storybook:update-snapshots` - update screenshots. It has to be run for every visual change
* `yarn run eslint` – Run linters
* `yarn run eslint:fix` – Fixed the linters and run prettier
* `yarn run format` – Run prettier to auto-format `*.js`, `*.jsx` and `*.css` files. This command will overwrite files without 
asking, `format:verify` won't.

Running `yarn run setup` once is required to enable all other tasks. The command might take a few minutes to finish.

We have published Storybook: https://splunk.github.io/addonfactory-ucc-generator/storybook

## Code Formatting

UCC UI Lib uses [prettier](https://github.com/prettier/prettier) to ensure consistent code formatting. It is recommended
 to [add a prettier plugin to your editor/ide](https://github.com/prettier/prettier#editor-integration).

## Screenshots testing

The repo contains screenshots of every story of storybook. It is stored in [Git Large File Storage](https://git-lfs.com/), so you need to install it (run `git lfs install` after installation).

The app looks differently for MacOS and Linux and there are few things helped to mitigate:
- Firefox browser is used for taking screenshots. See [package.json](./package.json) `test-storybook` command
- Tuned thresholds are defined in [test-runner.ts](.storybook/test-runner.ts). If story contains a lot of text, this threshold may need to be increased.
