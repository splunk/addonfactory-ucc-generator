# Contributing to UCC UI Lib

## Overview

The project contains UI framework that renders UI components dynamically based on provided `globalConfig.json`.

## Getting Started

1. Clone the repo.
2. Install yarn (>= 1.2) if you haven't already: `npm install --global yarn`.
3. Run the setup task: `yarn run setup`.

After this step, the following tasks will be available:

* `start` – Run the `start` task
* `build` – Create a production bundle
* `lint` – Run JS and CSS linters
* `format` – Run prettier to auto-format `*.js`, `*.jsx` and `*.css` files. This command will overwrite files without 
asking, `format:verify` won't.

Running `yarn run setup` once is required to enable all other tasks. The command might take a few minutes to finish.

## Slacks

If you are a Splunker use: https://splunk.slack.com/archives/C03T8QCHBTJ
If you are a part of the community use: https://splunk-usergroups.slack.com/archives/C03SG3ZL4S1

## Code Formatting

UCC UI Lib uses [prettier](https://github.com/prettier/prettier) to ensure consistent code formatting. It is recommended
 to [add a prettier plugin to your editor/ide](https://github.com/prettier/prettier#editor-integration).
