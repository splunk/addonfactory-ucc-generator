# Contributing to UCC UI Library

## Overview

This project includes a UI framework that dynamically renders UI components based on the provided `globalConfig.json`.

For a quickstart, please check [quick_start_ui.sh](../scripts/quick_start_ui.sh)

## Getting Started

1. Clone the repo.
1. Install yarn (>= 1.2) if you haven't already: `npm install --global yarn`.
1. Run the setup task: `yarn run setup`.

After completing these steps, the following tasks will be available:

* `yarn start` – Starts a server that serves JS bundles from memory and proxies other requests to the target, which is `localhost:8000` by default.
* `yarn build` – Creates a production bundle.
* `yarn build:watch` – Creates a dev bundle and writes to output folder
* `yarn run storybook` - Starts Storybook and opens <http://localhost:6006>.
* `yarn run test-storybook` - Checks if screenshots match for every story.
* `yarn run test-storybook:update-snapshots` - Updates screenshots. Must be run after every visual change.
* `yarn run eslint` – Runs linters.
* `yarn run eslint:fix` – Fixes linter issues and runs prettier.
* `yarn run format` – Runs prettier to auto-format `*.js`, `*.jsx`, and `*.css` files. This command overwrites files without confirmation. Use `format:verify` for a non-destructive check.

Running `yarn run setup` is required to enable all other tasks. This command might take a few minutes to complete.

We have published Storybook at: <https://splunk.github.io/addonfactory-ucc-generator/storybook>

## Development Server

This project integrates [webpack-dev-server](https://webpack.js.org/configuration/dev-server/) to enhance the development workflow, facilitating live reloading and in-memory serving of UI builds and static JavaScript files

```bash
yarn start
```

This initiates the server at <http://localhost:8080> (or a custom port, if configured) and automatically refreshes the browser upon detecting file changes. It intersects static assets for all TAs. You may want to change target for the proxy in the file [webpack.config.js](webpack.config.js)

## Code Formatting

UCC UI Lib uses [prettier](https://github.com/prettier/prettier) for consistent code formatting. It's recommended to [add a prettier plugin to your editor/IDE](https://github.com/prettier/prettier#editor-integration).

## Screenshot Testing Guide

This section outlines how to work with screenshot testing in our project, utilizing [Git Large File Storage (Git LFS)](https://git-lfs.com/) and a continuous integration (CI) setup to ensure visual consistency across our Storybook stories.

### Prerequisites

* Git LFS: Our screenshots are stored with Git LFS. Ensure it's installed on your system by following [the installation guide](https://github.com/git-lfs/git-lfs#installing). For MacOS it is:

```bash
brew install git-lfs
```

After installing Git LFS, set it up with the following command:

```bash
git lfs install
git lfs pull
```

### Automated Screenshot Testing

Our CI pipeline includes a job defined in [storybook-visual.yml](../.github/workflows/storybook-visual.yml). This job automates the following process:

* Build and serve Storybook.
* Captures screenshots of all stories.
* Compares these screenshots against those stored in the repository.
* If discrepancies are found, the job updates the screenshots and pushes the updates to the current branch.

### Updating Screenshots Locally

Due to differences in application appearance between MacOS and Linux (especially in text rendering), we recommend using Docker to update screenshots for consistency. Here's how you can update screenshots locally:

1. Start Storybook:

    Run Storybook locally using Yarn:

    ```bash
    yarn run storybook
    ```

1. Capture and Update Screenshots:

    Once Storybook is running, use Docker Compose to update the screenshots:

```bash
docker compose up --build
```

This approach ensures that screenshots are consistent and reflective of how the application is intended to look across different environments.

### Publishing UI as an NPM Package

The publish is done automatically by the CI pipeline. The version is determined by the version in the package.json file, which is updated by the release job. The publish commands are described in the file [npm-publish.yml](../.github/workflows/npm-publish.yml).

It is always a good thing to check if changes from this package are working for users of the package. In order to check changes locally, you can use [Verdaccio](https://github.com/verdaccio/verdaccio). Here is an outline

* Run Verdaccio server
* Publish the package to Verdaccio
* Switch to the TA repo and install the package from the localhost registry

First, you need to run Verdaccio server. You can do it by running the following command in the terminal:

```bash
npx verdaccio
```

Create a user if you haven't done it before. Actual credentials are not important since it is a local server.

```bash
npm adduser --scope=@splunk --registry http://localhost:4873/
```

It should be running all time in order you to publish or install packages. Then you can publish the package to Verdaccio using the following command:

```bash
# updates the version in package.json to make sure you don't publish the same version
npm version prerelease

npm publish --registry http://localhost:4873
```

You can inspect the published version by navigating to the page from the browser: <http://localhost:4873>.

In order to install the package from Verdaccio in TA repo, you can use the following command:

```bash
npm install @splunk/add-on-ucc-framework@latest --registry http://localhost:4873
# or
yarn add @splunk/add-on-ucc-framework@latest --registry http://localhost:4873
```

After you are done with testing, make sure you discard changes in the lock file of TA repository since it would contain localhost registry URL, as well as the version bump in the package.json file of UCC UI.
