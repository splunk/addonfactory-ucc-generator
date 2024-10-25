# Getting started 

Install the UCC framework and start building your first add-on. Then you can build new add-ons from the existing ones.

## Prerequisites

Make sure that the following software is installed on your machine:
* Python 3.7 or later 
* Git 

> **Note:** Git is used to generate the add-on version from the Git tags. Alternatively, you can use the `--ta-version` parameter and specify the version by yourself.

## Install

1. Go to the `splunk-add-on-ucc-framework` package that is available on PyPI. For more information about PyPI, see <https://pypi.org/project/splunk-add-on-ucc-framework/>.

If you use Windows, ...
If you use macOS, ...<!--- Artem to give more info--->

## Create a new add-on

You can initialize new add-ons from `ucc-gen` version `5.19.0` and later.

> **Note:** The commands used in this task are macOS and Linux specific.

1. Set up and activate the Python virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

1. Install `splunk-add-on-ucc-framework`:

```bash
pip install splunk-add-on-ucc-framework
```

1. Initialize a new add-on:

```bash
ucc-gen init --addon-name "demo_addon_for_splunk" --addon-display-name "Demo Add-on for Splunk" --addon-input-name demo_input
```
For more information about the add-ons naming convention, see [Naming conventions for apps and add-ons in Splunkbase](https://dev.splunk.com/enterprise/docs/releaseapps/splunkbase/namingguidelines/)

The new add-on is located in the `demo_addon_for_splunk` folder. 

Build your newly created add-on using the commands listed in the Commands section, see [Commands](commands.md).

## Build an add-on from the existing one

After initializing a new add-on, you can continue building it.

> **Note:** The command used in this task are macOS and Linux specific.

1. Set up and activate the Python virtual environment (skip if you already have an environment):

```bash
python3 -m venv .venv
source .venv/bin/activate
```

1. Install `splunk-add-on-ucc-framework`  (skip if you already installed the libraries):

```bash
pip install splunk-add-on-ucc-framework 
```

> **Note:** If you use UCC `v5.30.0+`, use the `ucc-gen package` command instead of `slim`. 

1. Run `ucc-gen build` and package it. Provide a `--ta-version=<version>` parameter if this repository is not version controlled.

```bash
ucc-gen build
slim package output/<add-on-name>
```

> **Note:** If you use UCC `v5.19.0` or later, use `ucc-gen build` instead of `ucc-gen`. 

The archive is created on the same level as your `globalConfig.json` file.

1. Go to your Splunk app instance and install this add-on using the generated archive. 

1. Open the add-on in your Splunk app instance, and check if it works as intended.

After you check that the add-on was loaded correctly and all the basic operations are working, you can extend the functionality of the input by copying and pasting the automatically generated modular inputs file into the `package/bin` folder. The generated inputs use the Splunk SDK for Python. See [https://github.com/splunk/splunk-sdk-python](https://github.com/splunk/splunk-sdk-python). 

After you update the modular input code, you can run `ucc-gen` again, and then `ucc-gen` uses updated modular inputs from `package/bin` instead of generating new ones.