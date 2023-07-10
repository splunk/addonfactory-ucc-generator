# Contributing Guidelines

## Build and Test

Download UCC UI and unpack it using the following commands:

```
./get-ucc-ui.sh
tar -zxf splunk-ucc-ui.tgz -C splunk_add_on_ucc_framework/
```

This project uses [`poetry 1.4.2`](https://python-poetry.org/).

To build a new local version of `ucc-gen`:

```
poetry build
```

### Unit tests

```
poetry run pytest tests/unit
```

### UI tests

If you need to run UI tests for the PR, please add a label "run-ui-tests". 

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
