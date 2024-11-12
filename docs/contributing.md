# Contributing Guidelines

We welcome contributions from the community! This guide will help you understand our contribution process and requirements.

## Development guidelines

1. Small PRs ([blogpost](https://testing.googleblog.com/2024/07/in-praise-of-small-pull-requests.html))
1. If you are fixing a bug, write a test reproducing a bug (the test should fail without your changes)
1. If you are refactoring, ensure adequate test coverage exists for the target area. If coverage is insufficient, create tests in a separate pull request first. This approach provides a safety net for validating current behavior and simplifies code reviews.

## Build and Test

Prerequisites:

- Node.js® LTS version (download [here](https://nodejs.org/en/download/package-manager))
- Yarn Classic (`npm install --global yarn`)
- Poetry 1.5.1. [Installation guide](https://python-poetry.org/docs/#installing-with-the-official-installer)

If you are interested in contributing to the UI, the `ui` folder has a separate README.md.

Script for building the backend, frontend, and spinning up the Docker container all at once:

```bash
./scripts/quick_start_ui.sh
```

Build the UI in the `ui/dist` folder and copy the files to the static folder of the UCC.

```bash
./scripts/build_ui.sh
```

Build a new local version of `ucc-gen`:

```bash
poetry build
```

### Unit tests

```bash
poetry run pytest tests/unit
```

### UI tests

If you need to run UI tests for the PR, add a "run-ui-tests" label before the PR is created.
UI tests will run automatically for any PR towards the `main` / `develop` branches, and on the `main` / `develop` branch as well.

1. With local version of ucc-gen, create a UCCExample add-on for the output directory:

    ```bash
    poetry run ucc-gen build --source tests/testdata/test_addons/package_global_config_everything/package
    ```

1. Install docker, and run containerized Splunk Enterprise using script:

    ```bash
    ./scripts/run_splunk.sh
    ```

   There are mapped default Splunk ports to host. To use a different configuration, see [docker-splunk](https://splunk.github.io/docker-splunk/). Remember to mount the output package to the Splunk apps directory.

1. Install any browser specific to this browser driver, such as [chromedriver](https://chromedriver.chromium.org/getting-started/) for Chrome.

1. Run tests using the following command:

    ```bash
    poetry run pytest tests/ui
    ```

   Default test parameters use Splunk connection details and credentials from the earlier step, and `chromedriver` is used as a default webdriver.  
   To use a different browser or Splunk configuration, set the proper parameters according to the [smartx-ui-test-library](https://addon-factory-smartx-ui-test-library.readthedocs.io/en/latest/how_to_use.html) documentation.

### Linting and Type-checking

`ucc-gen` uses the [`pre-commit`](https://pre-commit.com) framework for linting and type-checking.
Consult with `pre-commit` documentation about what is the best way to install the software.

To run it locally:

```bash
pre-commit run --all-files
```


## Building TA with the Local Version of UCC

UCC is a tool for Technology Add-ons (TAs), so it's important to test TA generation while developing UCC locally.

### Overview

1. Install Dependencies for Your TA
1. Build the TA Using Your Local UCC Version
1. Package the TA into a .tar.gz file using `ucc-gen package`

### Installing TA Dependencies

The method for installing dependencies may vary among different TAs. Common approaches include running Poetry, but please refer to your TA's documentation for specific instructions.

```bash
# These variables would be used in the further steps
ta_repo=/path/to/ta
ta_name=TA_Name_From_app.manifest

poetry install --directory=$ta_repo

mkdir -p $ta_repo/package/lib

# Export dependencies to 'requirements.txt'
poetry export --without-hashes -o $ta_repo/package/lib/requirements.txt --directory $ta_repo
```

> Note: ucc-gen expects dependencies to be listed in `package/lib/requirements.txt`.

### Building TA

```bash
poetry run ucc-gen build --source $ta_repo/package
```

Ensure you specify the `package` folder, not the repository root. Monitor the build process for any errors.

**Caveat**: The build command may run scripts from the TA repository that may not be tested if running from a non-TA repository. For example, `build-ui.sh` may use relative paths for building custom components. You might need to manually run the script and/or copy the files to the output directory of UCC.

```bash
# in case if TA has custom UI components
mkdir -p output/$ta_name/appserver/static/js/build
cp -a $ta_repo/output/$ta_name/appserver/static/js/build/custom output/$ta_name/appserver/static/js/build
```

### Packaging TA

```bash
poetry run ucc-gen package --path output/$ta_name
```

This command will generate a packaged TA (.tar.gz file) that you can install into Splunk.


## Documentation changes

Documentation changes are also welcome!

To verify changes locally:

```bash
poetry run mkdocs serve -a localhost:8001
```

## Issues and bug reports

If you're seeing some unexpected behavior with `ucc-gen`, create an [issue](https://github.com/splunk/addonfactory-ucc-generator/issues) on GitHub. You can click on "New Issue" and use the template provided.

## Pull requests

We love to see pull requests!

### PR Title

We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for PR titles. The title format is crucial as we squash commits during merge, and this PR title will be used in the release notes (for feat and fix types).
Here's a short TL;DR of the format:

```
<type>(<scope>): <description>

Types:
- feat: New feature (user facing)
- fix: Bug fix (user facing)
- docs: Documentation changes (user facing)
- style: Code style changes (formatting, etc.)
- refactor: Code changes that neither fix bugs nor add features
- perf: Performance improvements
- test: Adding or updating tests
- chore: Maintenance tasks
```

Example: `feat(ui): add new input validation for text fields`

### PR Description

Includes:

- Motivation behind the changes (any reference to issues or user stories)
- High level description of code changes
- Description of changes in user experience if applicable.
- Screenshots for UI changes (before and after)
- Steps to reproduce the issue or test the new feature, if possible. This will speed up the review process.


After submitting your PR, GitHub will automatically add relevant reviewers, and CI checks will run automatically.

> Note: `semgrep` and `fossa` checks might fail for external contributors. This is expected and will be handled by maintainers.


## Release flow

The instructions below utilize the [GitHub CLI tool](https://cli.github.com/), which you can install via HomeBrew:

```bash
brew install gh
gh auth login
```

- The default development branch is `develop`. Use this branch for creating pull requests (PRs) for your features, fixes, documentation updates, etc. PRs to the `develop` branch should be merged using the squash option on GitHub.
- When it's time for a release (handled by the UCC team), create a PR from `develop` to `main` using the following commands:

```bash
gh pr create --title "chore: merge develop into main" --body "" --head develop --base main
# set automerge with merge commit to avoid accidentally squashing PR
gh pr merge develop --auto --merge
```

- Ensure CI passes and await team review.
- PR should be merged using **merge commit** option in GitHub (already included in the command)
- Releases are made automatically (both on GitHub and PyPI), and a bot will push a commit to `main` with all necessary changes  (i.e. [like this](https://github.com/splunk/addonfactory-ucc-generator/commit/0c5e6802e1e52c37bf7131baf1b8264e5db30545))
- If necessary, update release notes and CHANGELOG.md accordingly to the content of the release.
- If any issue was solved by this release, remove **waiting-for-release** label from it and then close the issue.
- After the release, backport the bot's changes to the `develop` branch (i.e. [#974](https://github.com/splunk/addonfactory-ucc-generator/pull/974)):

```bash
gh pr create --title "chore: merge main into develop" --body "" --head main --base develop
# set automerge with merge commit to avoid accidentally squashing PR
gh pr merge main --auto --merge
```

- If a release encounters issues requiring a quick bug fix (handled by the UCC team):
    + Create a PR to the main branch with the fix, including tests that reproduce and then fix the issue.
    + Ensure CI passes and await team review.
    + Merge the PR using the merge commit option on GitHub.
    + Backport the bug fix PR to the develop branch.


- After release is done, announce it to community on slack channels:
    + [Internal UCC channel](https://splunk.enterprise.slack.com/archives/C03T8QCHBTJ)
    + [Splunk Usergroup UCC channel](https://splunk-usergroups.slack.com/archives/C03SG3ZL4S1)
