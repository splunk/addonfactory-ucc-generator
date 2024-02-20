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

## Screenshot Testing Guide
This section outlines how to work with screenshot testing in our project, utilizing [Git Large File Storage (Git LFS)](https://git-lfs.com/) and a continuous integration (CI) setup to ensure visual consistency across our Storybook stories.

### Prerequisites
- Git LFS: Our screenshots are stored with Git LFS. Ensure it's installed on your system by following [the installation guide](https://github.com/git-lfs/git-lfs#installing). For MacOS it is:
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
- Build and serve Storybook.
- Captures screenshots of all stories.
- Compares these screenshots against those stored in the repository.
- If discrepancies are found, the job updates the screenshots and pushes the updates to the current branch.

### Updating Screenshots Locally
Due to differences in application appearance between MacOS and Linux (especially in text rendering), we recommend using Docker to update screenshots for consistency. Here's how you can update screenshots locally:

1. Start Storybook:

Run Storybook locally using Yarn:

```bash
yarn run storybook
```

2. Capture and Update Screenshots:

Once Storybook is running, use Docker Compose to update the screenshots:

```bash
docker compose up --build
```
This approach ensures that screenshots are consistent and reflective of how the application is intended to look across different environments.
