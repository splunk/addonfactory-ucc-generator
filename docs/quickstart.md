# Getting started

Install the UCC framework and start building your first add-on. Then you can build new add-ons from the existing ones.

## Prerequisites

Make sure that the following software is installed on your machine:

* Python 3.9 or later
* Git

> **Note:** Git is used to generate the add-on version from the Git tags. Alternatively, you can use the `--ta-version` parameter and specify the version by yourself.

## Install

### Create and activate the virtual environment

Depending on which operating system you use, follow one of the procedures:

#### Windows

Set up the Python virtual environment:

```bash
python3 -m venv .venv
```

If you use cmd.exe, activate the virtual environment with the following command:

```bash
.venv\Scripts\activate.bat
```

If you use PowerShell, activate the virtual environment with the following command:

```bash
.venv\Scripts\activate.ps1
```

#### macOS, Linux

Set up and activate the Python virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Install UCC package

Install UCC package, it is available on PyPI, see <https://pypi.org/project/splunk-add-on-ucc-framework/>.

```bash
pip install splunk-add-on-ucc-framework
```

## Create a new add-on

### Initialize a new add-on

```bash
ucc-gen init --addon-name "demo_addon_for_splunk" --addon-display-name "Demo Add-on for Splunk" --addon-input-name demo_input
```

For more information about the add-ons naming convention, see [Naming conventions for apps and add-ons in Splunkbase](https://dev.splunk.com/enterprise/docs/releaseapps/splunkbase/namingguidelines/)

The new add-on is located in the `demo_addon_for_splunk` folder.

### Build the add-on

```bash
ucc-gen build --source demo_addon_for_splunk/package --ta-version 1.0.0
```

### Package the add-on

```bash
ucc-gen package --path output/demo_addon_for_splunk
```

The archive is created on the same level as your `globalConfig.json` file.

For more information regarding commands, see [Commands](commands.md).

### Install the add-on

Go to your Splunk app instance and install this add-on using the generated archive.

After you check that the add-on was loaded correctly and all the basic operations are working, you can extend the functionality of the input by copying and pasting the automatically generated modular inputs file into the `package/bin` folder. The generated inputs use the Splunk SDK for Python. See [https://github.com/splunk/splunk-sdk-python](https://github.com/splunk/splunk-sdk-python).

After you update the modular input code, you can run `ucc-gen` again, and then `ucc-gen` uses updated modular inputs from `package/bin` instead of generating new ones.
