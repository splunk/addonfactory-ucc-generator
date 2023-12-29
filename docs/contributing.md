# Contributing Guidelines

## Development flow

* Default development branch is `develop`. Please use it when creating PRs with your features, fixes, documentation updates etc. PRs to `develop` branch should be merged using squash option in GitHub.
* When the release time comes (should be handled by UCC team) - create a PR from `develop` to `main`
    * make sure that CI is passing and wait for the review from the team
    * PR should be merged using merge commit option in GitHub
    * release will be made automatically (both GitHub and PyPI) and bot will push a commit to `main` with all necessary changes (i.e. [like this](https://github.com/splunk/addonfactory-ucc-generator/commit/0c5e6802e1e52c37bf7131baf1b8264e5db30545))
    * after release is done - you need to backport bot's changes to the `develop` branch (i.e. [#974](https://github.com/splunk/addonfactory-ucc-generator/pull/974))
* If release did not go well and a quick bug fix needs to be released (should be handled by UCC team)
    * create a PR to `main` branch with a fix (with tests reproducing and then fixing the issue)
    * make sure that CI is passing and wait for the review from the team
    * PR should be merged using merge commit option in GitHub
    * bug fix PR needs to be backported back to `develop` branch

## Build and Test

Prerequisites:
- Node.js LTS version ([NodeJS](https://nodejs.org/en/download) or use [nvm](https://github.com/nvm-sh/nvm))
- Yarn Classic (`npm install --global yarn`)
- Poetry 1.5.1. [Installation guide](https://python-poetry.org/docs/#installing-with-the-official-installer)

If you are interested in contributing to UI, `ui` folder has separate README.md.

Building UI in `ui/dist` folder and copying files to static folder of UCC.
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

If you need to run UI tests for the PR, please add a label "run-ui-tests" (do this before PR is created). 
UI tests will run automatically for any PR towards `main` / `develop` branches and on the `main` / `develop` branch as well. 

1. With local version of ucc-gen create UCCExample TA to output directory:
    ```
    poetry run ucc-gen build --source tests/testdata/test_addons/package_global_config_everything/package
    ```
2. Install docker and run containerized Splunk Enterprise using script:
    ```
    ./run_splunk.sh
    ```
   There are mapped default Splunk ports to host. To use different configuration see [docker-splunk](https://splunk.github.io/docker-splunk/). Remember to mount output package to Splunk apps directory.
3. Install any browser and specific to this browser driver such as [chromedriver](https://chromedriver.chromium.org/getting-started/) for Chrome.
4. Run tests using command:
    ```
    poetry run pytest tests/ui
    ```
   Default test parameters are using Splunk connection details and credentials from earlier step and `chromedriver` is used as a default webdriver.  
   To use different browser or Splunk configuration set proper parameters according to the [smartx-ui-test-library](https://addon-factory-smartx-ui-test-library.readthedocs.io/en/latest/how_to_use.html) documentation.

## Linting and Type-checking

`ucc-gen` uses [`pre-commit`](https://pre-commit.com) framework for linting and type-checking.
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

If you're seeing some unexpected behavior with `ucc-gen`, please create an [issue](https://github.com/splunk/addonfactory-ucc-generator/issues) on GitHub. You can click on "New Issue" and use the template provided.

## Pull requests

We love to see pull requests!

We are using [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).
Two most important "types": "fix" and "feat" would result in the new version of the `ucc-gen` once merged.

Do the changes you think are needed, run the steps above (build / test / linting / documentation).
After you create a PR, all the needed reviewers will be added automatically by GitHub.

Gotcha: `semgrep` and `fossa` steps may fail if you are an external contributor, this is expected for now.
