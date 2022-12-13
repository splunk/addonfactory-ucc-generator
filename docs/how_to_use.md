# How To Use

## Prerequisites

You need to have Python 3.7+ and Git available in the machine to be able to utilize `ucc-gen` command.

> Git is used to generate the add-on version from Git tags. Alternatively you can use `--ta-version` parameter. More info [here](#parameters).

To be able to create an add-on using UCC framework, you need to have at least:

* `globalConfig` file (in `JSON` or `YAML` format, `JSON` is mostly used)
* `package` folder
* `app.manifest` in the `package` folder ([documentation here](https://dev.splunk.com/enterprise/reference/packagingtoolkit/pkgtoolkitappmanifest/)).

> If both globalConfig.json and globalConfig.yaml files are present, then the globalConfig.json file will take precedence.

An example of creating a basic add-on can be found [here](example.md).

### VSCode extension

You can use [Splunk Extension for VSCode](https://marketplace.visualstudio.com/items?itemName=Splunk.splunk) as well.

### JSON schema for globalConfig

The JSON schema for the `globalConfig` file can be found
[here](https://github.com/splunk/addonfactory-ucc-base-ui/blob/main/src/main/webapp/schema/schema.json).

### Add-on naming convention

Refer to Splunkbase documentation 
[here](https://dev.splunk.com/enterprise/docs/releaseapps/splunkbase/namingguidelines/) 
to figure out what should be the name of your add-on.

## Steps to generate the add-on

Commands below are macOS and Linux specific.

* Set up and activate Python virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

* Install `splunk-add-on-ucc-framework` and `splunk-packaging-toolkit`

```bash
pip install splunk-add-on-ucc-framework splunk-packaging-toolkit
```

* Run `ucc-gen` and package it

> Provide `--ta-version=<version>` parameter if this repository is not version controlled.

```bash
ucc-gen
slim package output/<add-on-name>
```

Now you should see an archive created in the same level as your 
`globalConfig.json` is located.

Now you can go to Splunk and install this add-on using the generated archive.

After validating that the add-on was loaded fine and all the basic operations 
are working, you can extend the functionality of the input by copying and 
pasting the automatically generated modular inputs file into `package/bin` 
folder and extending their functionality. The generated inputs are using 
[Splunk SDK for Python](https://github.com/splunk/splunk-sdk-python). After you
update the modular input code, you can run `ucc-gen` again and `ucc-gen` will 
use updated modular inputs from `package/bin` instead of generating new ones.

## Parameters

`ucc-gen` supports the following params:

* `source` - [optional] folder containing the `app.manifest` and app 
    source.
* `config` - [optional] path to the configuration file, defaults to
    globalConfig file in the parent directory of source provided.
* `ta-version` - [optional] override current version of TA, default
    version is version specified in `globalConfig.json` or `globalConfig.yaml`. 
    Splunkbase compatible version of SEMVER will be used by default.
* `python-binary-name` - [optional] Python binary name to use when
    installing Python libraries.

## What `ucc-gen` does

* Cleans the output folder.
* Retrieves the package ID of addon.
* Copies UCC template directory under `output/<package_ID>` directory.
* Copies globalConfig.json or globalConfig.yaml file to
    `output/<package_ID>/appserver/static/js/build` directory.
* Collects and install Addon's requirements into
    `output/<package_ID>/lib` directory of addon's package.
* For the addon's requirements, packages are installed according to
    following table:
    * `lib/requirements.txt` - install Python3 compatible packages into
        `output/<package_ID>/lib`
    * Removes `setuptools*`, `bin*`, `pip*`, `distribute*`, `wheel*` if 
        they exist from `output/<package_ID>/lib`
    * Removes execute bit from every file under `output/<package_ID>/lib`
* Replaces tokens in views.
* Copies addon's `package/*` to `output/<package_ID>/*` directory.
* If an addon requires some additional configurations in packaging
    then `ucc-gen` runs the code in the `additional_packaging.py` file as well.

## `additional_packaging.py` file

To extend the build process, you can create `additional_packaging.py` file in the same file level where you have your globalConfig file.

This file should have `additional_packaging` function which accepts 1 argument: add-on name.

Example of how to utilize it:

* Build custom UI after `ucc-gen` finishes all its necessary steps.
* Workaround a `ucc-gen` feature which was not implemented.
