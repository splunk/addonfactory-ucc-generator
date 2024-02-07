# Quickstart

## Prerequisites

You need to have Python 3.7+ and Git available in the machine to be able to utilize `ucc-gen` command.

> Git is used to generate the add-on version from Git tags. Alternatively you can use `--ta-version` parameter. More info below.

To be able to create an add-on using UCC framework, you need to have at least:

* `globalConfig` file (in `JSON` or `YAML` format, `JSON` is mostly used)
* `package` folder
* `app.manifest` in the `package` folder ([documentation here](https://dev.splunk.com/enterprise/reference/packagingtoolkit/pkgtoolkitappmanifest/)).

`app.manifest` file now is being validated according to the [documentation here](https://dev.splunk.com/enterprise/reference/packagingtoolkit/pkgtoolkitappmanifest/#JSON-schema-200).

> If both globalConfig.json and globalConfig.yaml files are present, then the globalConfig.json file will take precedence.

The JSON schema for the `globalConfig` file can be found in `splunk_add_on_ucc_framework/schema/schema.json` file.

### Add-on naming convention

Refer to Splunkbase documentation 
[here](https://dev.splunk.com/enterprise/docs/releaseapps/splunkbase/namingguidelines/) 
to figure out what should be the name of your add-on.

## Initialize new add-on

> Initialization of the new add-on is available from `5.19.0` version of `ucc-gen`.

Commands below are macOS and Linux specific.

* Set up and activate Python virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

* Install `splunk-add-on-ucc-framework`

```bash
pip install splunk-add-on-ucc-framework
```

* Initialize new add-on

```bash
ucc-gen init --addon-name "demo_addon_for_splunk" --addon-display-name "Demo Add-on for Splunk" --addon-input-name demo_input
```

The new add-on is located in `demo_addon_for_splunk` folder and can be built using 
the commands [below](#build-already-existing-add-on).

## Build already existing add-on

Commands below are macOS and Linux specific.

* Set up and activate Python virtual environment (skip if you already have an environment)

```bash
python3 -m venv .venv
source .venv/bin/activate
```

* Install `splunk-add-on-ucc-framework` and `splunk-packaging-toolkit` (skip if you already installed libraries)

```bash
pip install splunk-add-on-ucc-framework splunk-packaging-toolkit
```

> Note: `splunk-packaging-toolkit` does not work with Python 3.10+.

> Note: `ucc-gen package` can be used instead of `slim` if UCC `v5.30.0+` is used (more details below). 

* Run `ucc-gen build` and package it

> Provide `--ta-version=<version>` parameter if this repository is not version controlled.

```bash
ucc-gen build
slim package output/<add-on-name>
```

> Please use `ucc-gen build` instead of `ucc-gen` if you are using UCC `v5.19.0` and higher.

Now you should see an archive created in the same level as your `globalConfig.json` is located.

Now you can go to Splunk and install this add-on using the generated archive.

After validating that the add-on was loaded fine and all the basic operations 
are working, you can extend the functionality of the input by copying and 
pasting the automatically generated modular inputs file into `package/bin` 
folder and extending their functionality. The generated inputs are using 
[Splunk SDK for Python](https://github.com/splunk/splunk-sdk-python). After you
update the modular input code, you can run `ucc-gen` again and `ucc-gen` will 
use updated modular inputs from `package/bin` instead of generating new ones.

## Commands

### `ucc-gen build`

Builds the add-on. As of now, running `ucc-gen` does the same thing as running `ucc-gen build`, 
but eventually calling `ucc-gen` without specifying a subcommand will be 
deprecated.

It takes the following parameters:

* `--source` - [optional] folder containing the `app.manifest` and app 
    source. Default: `package`.
* `--config` - [optional] path to the configuration file, defaults to
    globalConfig file in the parent directory of source provided.
* `--ta-version` - [optional] override current version of TA, default
    version is version specified in `globalConfig.json` or `globalConfig.yaml`. 
    Splunkbase compatible version of SEMVER will be used by default.
* `-o` / `--output` - [optional] output folder to store build add-on in.
    By default, it will be saved in the `current directory/output` folder.
    Accepts absolute paths as well.
* `--python-binary-name` - [optional] Python binary name to use when
    installing Python libraries. Default: `python3`.
* `-v` / `--verbose` - [optional] show detailed information about
    created/copied/modified/conflict files after build is complete.
    This option is in experimental mode. Default: `False`.
* `--pip-version` - [optional] pip version that will be used to install python libraries. Default: `latest`.
* `--pip-legacy-resolver` - [optional] Use old pip dependency resolver by adding flag '--use-deprecated=legacy-resolver' 
  to pip install command. Default: `False`. PLEASE NOTE: this flag is deprecated and will be removed from pip in the future.
Instead of using this flag, the correct solution would be to fix the packages your project depends on to work properly with the new resolver.
Additionally, please note that this flag is not compatible with pip version `23.2`, use `23.2.1` instead. 


#### [Optional] Python Static file analysis - linter

UCC uses [pylint](https://pypi.org/project/pylint/) to check all python files located in /bin directory, although the library itself is not provided. 
To trigger this mode during build run you need to install pylint on your environment. The result of linter run will be printed at the end in form of
short summary of warnings and errors found (PEP, refactor and import errors are ignored).

When running in Verbose mode it will print more detailed information about found issues in affected files.


#### Verbose mode

Available from `v5.35.0`.

Running `ucc-gen build -v` or `ucc-gen build --verbose` prints additional information about
what was exactly created / copied / modified / conflict after the build is complete. It does
not scan `lib` folder due to the nature of the folder.

Below is the explanation on what exactly each state means:

* `created` - file is not in the original package and was created during the build process
* `copied` - file is in the original package and was copied during the build process
* `modified` - file is in the original package and was modified during the build process
* `conflict` - file is in the original package and was copied during the build process but may be generated by UCC itself so incorrect usage can lead to not working add-on

### `ucc-gen init`

Initializes the add-on (available from `v5.19.0`).
`ucc-gen init` command initializes the add-on and bootstraps some code in the 
modular input which you, as a developer, can extend for your needs.

Apart from standard files needed for the add-on, it also adds search head 
clustering files in `default/server.conf` file and reload triggers in 
`default/app.conf` file. Those files will be generated automatically soon by 
`ucc-gen build` command itself, for now you need to include them manually 
during the add-on development.

It takes the following parameters:

* `--addon-name` - [required] add-on name. Consult with 
    [official naming convention guide](https://dev.splunk.com/enterprise/docs/releaseapps/splunkbase/namingguidelines/).
* `--addon-rest-root` - [optional] add-on REST root, defaults to `--addon-name` if not provided. 
* `--addon-display-name` - [required] add-on "official" name.
* `--addon-input-name` - [required] name of the generated input. 
* `--addon-version` - [optional] version of the generated add-on, `0.0.1` by default.
* `--overwrite` - [optional] overwrites already existing folder if used, 
    by default you can't generate a new add-on to already existing folder.

### `ucc-gen import-from-aob`

Import from AoB (Add-on Builder) (available from `v5.24.0`). It is in the
**experimental** state as of now, meaning that running this command may not
produce 100% UCC compatible add-on, but we are going to work on future
improvements for the script itself.

> Note: `import-from-aob` command does not support Windows as of now.

The import functionality is based on the 
[ucc_migration_test](https://github.com/tmartin14/ucc_migration_test) bash
script.
One of the ways you can use it is to download an AoB-based add-on from
Splunkbase, unarchive it and use 
`ucc-gen import-from-aob --addon-name <unarchived-folder-name>`. Or you can
run the same command against your locally developed add-on, but it should be
exported from AoB.

It takes the following parameters:

* `--addon-name` - [required] add-on name.

### `ucc-gen package`

Available from `v5.30.0`. Packages the add-on so it can be installed. 
It mimics the basics of the `slim package` command. This command can be used for most of the simple cases.

It does not support:

* `.slimignore` file
* [dependencies section](https://dev.splunk.com/enterprise/docs/releaseapps/packageapps/packagingtoolkit/#Dependencies-section)

It takes the following parameters:

* `--path` - [required] path to the built add-on (should include `app.manifest` file).
* `-o` / `--output` - [optional] output folder to store packaged add-on in.
    By default, it will be saved in the `current directory` folder.
    Accepts absolute paths as well.

## What `ucc-gen build` does

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
