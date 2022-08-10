# Contributing Guidelines

## Build and Test

This project uses [`poetry`](https://python-poetry.org/).

To build a new local version of `ucc-gen`:

```
poetry build
```

To run the unit tests: 

```
poetry run pytest tests/unit
```

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
