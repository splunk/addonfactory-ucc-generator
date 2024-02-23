# Contributing Guidelines

## Development flow

The instructions below utilize the [GitHub CLI tool](https://cli.github.com/), which you can install via HomeBrew:
```bash
brew install gh
gh auth login
```

* The default development branch is `develop`. Use this branch for creating pull requests (PRs) for your features, fixes, documentation updates, etc. PRs to the `develop` branch should be merged using the squash option on GitHub.
* When it's time for a release (handled by the UCC team), create a PR from `develop` to `main` using the following commands:
```bash
gh pr create --title "chore: merge develop into main" --body "" --head develop --base main
# set automerge with merge commit to avoid accidentally squashing PR
gh pr merge develop --auto --merge
```

* Ensure CI passes and await team review.
* PR should be merged using **merge commit** option in GitHub (already included in the command)
* Releases are made automatically (both on GitHub and PyPI), and a bot will push a commit to `main` with all necessary changes  (i.e. [like this](https://github.com/splunk/addonfactory-ucc-generator/commit/0c5e6802e1e52c37bf7131baf1b8264e5db30545))
* After the release, backport the bot's changes to the `develop` branch (i.e. [#974](https://github.com/splunk/addonfactory-ucc-generator/pull/974)):

```bash
gh pr create --title "chore: merge main into develop" --body "" --head main --base develop
# set automerge with merge commit to avoid accidentally squashing PR
gh pr merge main --auto --merge
```

* If a release encounters issues requiring a quick bug fix (handled by the UCC team):
  * Create a PR to the main branch with the fix, including tests that reproduce and then fix the issue.
  * Ensure CI passes and await team review.
  * Merge the PR using the merge commit option on GitHub.
  * Backport the bug fix PR to the develop branch.

## Build and Test

Prerequisites:
- Node.js LTS version ([NodeJS](https://nodejs.org/en/download), or use [nvm](https://github.com/nvm-sh/nvm))
- Yarn Classic (`npm install --global yarn`)
- Poetry 1.5.1. [Installation guide](https://python-poetry.org/docs/#installing-with-the-official-installer)

If you are interested in contributing to the UI, the `ui` folder has a separate README.md.

Build the UI in the `ui/dist` folder and copy the files to the static folder of the UCC.
```
./build-ui.sh
```

Build a new local version of `ucc-gen`:

```
poetry build
```

### Unit tests

```
poetry run pytest tests/unit
```

### UI tests

If you need to run UI tests for the PR, add a "run-ui-tests" label before the PR is created. 
UI tests will run automatically for any PR towards the `main` / `develop` branches, and on the `main` / `develop` branch as well. 

1. With local version of ucc-gen, create a UCCExample add-on for the output directory:
    ```
    poetry run ucc-gen build --source tests/testdata/test_addons/package_global_config_everything/package
    ```
2. Install docker, and run containerized Splunk Enterprise using script:
    ```
    ./run_splunk.sh
    ```
   There are mapped default Splunk ports to host. To use a different configuration, see [docker-splunk](https://splunk.github.io/docker-splunk/). Remember to mount the output package to the Splunk apps directory.
3. Install any browser specific to this browser driver, such as [chromedriver](https://chromedriver.chromium.org/getting-started/) for Chrome.
4. Run tests using the following command:
    ```
    poetry run pytest tests/ui
    ```
   Default test parameters use Splunk connection details and credentials from the earlier step, and `chromedriver` is used as a default webdriver.  
   To use a different browser or Splunk configuration, set the proper parameters according to the [smartx-ui-test-library](https://addon-factory-smartx-ui-test-library.readthedocs.io/en/latest/how_to_use.html) documentation.

## Linting and Type-checking

`ucc-gen` uses the [`pre-commit`](https://pre-commit.com) framework for linting and type-checking.
Consult with `pre-commit` documentation about what is the best way to install the software.

To run it locally:

```
pre-commit run --all-files
```

## Documentation changes

Documentation changes are also welcome!

To verify changes locally:

```
poetry run mkdocs serve
```

## Issues and bug reports

If you're seeing some unexpected behavior with `ucc-gen`, create an [issue](https://github.com/splunk/addonfactory-ucc-generator/issues) on GitHub. You can click on "New Issue" and use the template provided.

## Pull requests

We love to see pull requests!

We are using [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).
The two most important types: "fix" and "feat", would result in the new version of the `ucc-gen` once merged.

To do the changes you think are needed, run the previous steps (build / test / linting / documentation).
After you create a PR, all the needed reviewers will be added automatically by GitHub.

Gotcha: The `semgrep` and `fossa` steps might fail if you are an external contributor. This is expected for now.
