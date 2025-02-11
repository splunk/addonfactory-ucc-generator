# Contributing to the UCC UI Library

## Overview

This project features a UI framework that dynamically renders UI components based on a provided `globalConfig.json`.

For a quick start, refer to the [quick_start_ui.sh](../scripts/quick_start_ui.sh) script.

## Getting Started

1. Clone the repository.
1. Install Yarn Classic (version >=1.2) if you haven't already: `npm install --global yarn`.
1. Execute the setup task: `yarn run setup`.

Once these steps are complete, the following tasks become available:

* `yarn start` – Initiates a server that serves JavaScript bundles from memory and proxies other requests to the target (default: `localhost:8000`).
* `yarn build` – Generates a production bundle.
* `yarn build:watch` – Creates a development bundle and writes it to the output folder.
* `yarn run storybook` – Launches Storybook and opens <http://localhost:6006>.
* `yarn run test-storybook` – Verifies if screenshots match for each story.
* `yarn run test-storybook:update-snapshots` – Updates screenshots.  Run this after any visual modifications.
* `yarn run eslint` – Executes linters.
* `yarn run eslint:fix` – Addresses linter issues and applies Prettier formatting.
* `yarn run format` – Uses Prettier to automatically format source code files.  This command overwrites files without prompting. Use `format:verify` for a non-destructive check.

Running `yarn run setup` is a prerequisite for all other tasks.  This command may require a few minutes to finish.

A published version of Storybook is available at: <https://splunk.github.io/addonfactory-ucc-generator/storybook>

## Development Server

This project incorporates [webpack-dev-server](https://webpack.js.org/configuration/dev-server/) to streamline development, providing live reloading and in-memory serving of UI builds and static JavaScript files.

```bash
yarn start
```

This starts the server at <http://localhost:8080> (or a custom port, if specified) and automatically refreshes the browser when file changes are detected. It intersects static assets for all TAs. You might want to modify the proxy target in the [webpack.config.js](webpack.config.js) file.

## Code Formatting

The UCC UI Library utilizes [Prettier](https://github.com/prettier/prettier) to ensure consistent code formatting.  It's highly recommended to [integrate a Prettier plugin into your editor/IDE](https://github.com/prettier/prettier#editor-integration).

## Screenshot Testing Guide

This section details how to use screenshot testing, leveraging [Git Large File Storage (Git LFS)](https://git-lfs.com/) and a continuous integration (CI) setup to maintain visual consistency across Storybook stories.

### Prerequisites

* **Git LFS:** Screenshots are stored using Git LFS.  Ensure it's installed on your system by following the [installation guide](https://github.com/git-lfs/git-lfs#installing).  For macOS:

    ```bash
    brew install git-lfs
    ```

    After installing Git LFS, initialize it with:

    ```bash
    git lfs install
    git lfs pull
    ```

### Automated Screenshot Testing

Our CI pipeline includes a job defined in [storybook-visual.yml](../.github/workflows/storybook-visual.yml). This job automates the following:

* Builds and serves Storybook.
* Captures screenshots of all stories.
* Compares these screenshots against those stored in the repository.
* If differences are detected, the job updates the screenshots and pushes the changes to the current branch.

### Updating Screenshots Locally

Due to differences in application rendering between macOS and Linux (particularly text rendering), we recommend using Docker to update screenshots for consistency.  Follow these steps:

1. **Start Storybook:**

    Launch Storybook locally using Yarn:

    ```bash
    yarn run storybook
    ```

1. **Capture and Update Screenshots:**

    With Storybook running, use Docker Compose to update the screenshots:

    ```bash
    docker compose up --build
    ```

This ensures that screenshots are consistent and accurately represent the application's appearance across different environments.

## Publishing the UI as an NPM Package

Publishing is handled automatically by the CI pipeline. The version is determined by the `version` field in the `package.json` file, which is updated by the release job. The publishing commands are described in [npm-publish.yml](../.github/workflows/npm-publish.yml).

It's good practice to verify that changes in this package function correctly for users. To test changes locally, you can use [Verdaccio](https://github.com/verdaccio/verdaccio). Here's a brief overview:

* Run a Verdaccio server.
* Publish the package to Verdaccio.
* Switch to the TA repository and install the package from the local registry.

First, start the Verdaccio server. Execute this command in your terminal:

```bash
npx verdaccio
```

Create a user if you haven't already. The actual credentials aren't critical since it's a local server.

```bash
npm adduser --scope=@splunk --registry http://localhost:4873/
```

Keep the server running while publishing or installing packages.  Publish the package to Verdaccio using:

```bash
# Updates the version in package.json to prevent publishing the same version.
npm version prerelease

npm publish --registry http://localhost:4873
```

You can inspect the published version by visiting <http://localhost:4873> in your browser.

To install the package from Verdaccio in your TA repository, use:

```bash
npm install @splunk/add-on-ucc-framework@latest --registry http://localhost:4873
# or
yarn add @splunk/add-on-ucc-framework@latest --registry http://localhost:4873
```

After testing, discard changes in the TA repository's lock file (which will contain the localhost registry URL) and the version bump in the UCC UI's `package.json` file.
