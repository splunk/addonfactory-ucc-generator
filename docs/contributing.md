# Contributing Guidelines

## Development flow

* The default development branch is `develop`. Use it when creating PRs with your features, fixes, documentation updates, etc. PRs to the `develop` branch should be merged using the squash option in GitHub.
* When the release time comes, (which should be handled by the UCC team), create a PR from `develop` to `main`.
    * Make sure that the CI is passing and wait for the review from the team/
    * PR should be merged using the merge commit option in GitHub.
    * The release will be made automatically (for both GitHub and PyPI) and the bot will push a commit to `main` with all necessary changes (i.e. [like this](https://github.com/splunk/addonfactory-ucc-generator/commit/0c5e6802e1e52c37bf7131baf1b8264e5db30545)).
    * after the release is done, you will need to backport the bot's changes to the `develop` branch (i.e. [#974](https://github.com/splunk/addonfactory-ucc-generator/pull/974)).
* If the release did not go well and a quick bug fix needs to be released, (which should be handled by UCC team):
    * Create a PR to `main` branch with a fix, with tests reproducing and then fixing the issue.
    * Make sure that CI is passing and wait for the review from the team.
    * The PR should be merged using the merge commit option in GitHub.
    * The bug fix PR needs to be backported back to the `develop` branch.

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

Building a new local version of `ucc-gen`:

```
poetry build
```

### Unit tests

```
poetry run pytest tests/unit
```

### UI tests

If you need to run UI tests for the PR, please add a label "run-ui-tests" before the PR is created. 
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
The two most important "types", "fix" and "feat", would result in the new version of the `ucc-gen` once merged.

To do the changes you think are needed, run the previous steps (build / test / linting / documentation).
After you create a PR, all the needed reviewers will be added automatically by GitHub.

Gotcha: The `semgrep` and `fossa` steps might fail if you are an external contributor. This is expected for now.
