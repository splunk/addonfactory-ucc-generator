# Quickstart

## Prerequisites

You need to have Python 3.7+ and Git available in your machine to be able to use the `ucc-gen` command.

> Git is used to generate the add-on version from Git tags. Alternatively, you can use the `--ta-version` parameter. 
To be able to create an add-on using the UCC framework, you need to have at least:

* a `globalConfig` file (in `JSON` or `YAML` format, `JSON` is mostly used).
* a `package` folder.
* `app.manifest` in the `package` folder ([documentation here](https://dev.splunk.com/enterprise/reference/packagingtoolkit/pkgtoolkitappmanifest/)).

The `app.manifest` file now is being validated. See [Splunk Packaging Toolkit app.manifest schema definition](https://dev.splunk.com/enterprise/reference/packagingtoolkit/pkgtoolkitappmanifest/#JSON-schema-200) for more details.

> If both the globalConfig.json and globalConfig.yaml files are present, then the globalConfig.json file will take precedence.

The JSON schema for the `globalConfig` file can be found in the `splunk_add_on_ucc_framework/schema/schema.json` file.

### Add-on naming convention

See [Naming conventions for apps and add-ons in Splunkbase](https://dev.splunk.com/enterprise/docs/releaseapps/splunkbase/namingguidelines/) 
for help naming your add-on. 

## Initialize new add-on

> Initialization of the new add-on is available from version `5.19.0` and up of `ucc-gen`.

The following commands are macOS and Linux specific.

* Set up and activate the Python virtual environment: 

```bash
python3 -m venv .venv
source .venv/bin/activate
```

* Install `splunk-add-on-ucc-framework`:

```bash
pip install splunk-add-on-ucc-framework
```

* Initialize the new add-on:

```bash
ucc-gen init --addon-name "demo_addon_for_splunk" --addon-display-name "Demo Add-on for Splunk" --addon-input-name demo_input
```

The new add-on is located in the `demo_addon_for_splunk` folder and can be built using 
the [the following commands](#build-already-existing-add-on):

## Build the already existing add-on

The following commands are macOS and Linux specific:

* Set up and activate the Python virtual environment (skip if you already have an environment):

```bash
python3 -m venv .venv
source .venv/bin/activate
```

* Install `splunk-add-on-ucc-framework` and `splunk-packaging-toolkit` (skip if you already installed the libraries):

```bash
pip install splunk-add-on-ucc-framework splunk-packaging-toolkit
```

> Note: `splunk-packaging-toolkit` does not work with Python 3.10+.

> Note: If you use UCC `v5.30.0+`, `ucc-gen package` can be used instead of `slim`. 

* Run `ucc-gen build` and package it

> Provide a `--ta-version=<version>` parameter if this repository is not version controlled.

```bash
ucc-gen build
slim package output/<add-on-name>
```

> Please use `ucc-gen build` instead of `ucc-gen` if you are using UCC `v5.19.0` or higher.

Now you should see an archive created on the same level as your `globalConfig.json`.

Now you can go to Splunk and install this add-on using the generated archive.

After validating that the add-on was loaded correctly and all the basic operations 
are working, you can extend the functionality of the input by copying and 
pasting the automatically generated modular inputs file into the `package/bin` 
folder. The generated inputs use the
[Splunk SDK for Python](https://github.com/splunk/splunk-sdk-python). After you
update the modular input code, you can run `ucc-gen` again, and then `ucc-gen` will 
use updated modular inputs from `package/bin` instead of generating new ones.

## Commands

### `ucc-gen build`

The `ucc-gen build` command builds the add-on. As of now, running `ucc-gen` does the same thing as running `ucc-gen build`, 
but eventually calling `ucc-gen` without specifying a subcommand will be 
deprecated.

It takes the following parameters:

* `--source` - [optional] folder containing the `app.manifest` and app 
    source. The default is `package`.
* `--config` - [optional] path to the configuration file. It defaults to
    the globalConfig file in the parent directory of the source provided.
* `--ta-version` - [optional] override current version of TA. The default
    version is version specified in `globalConfig.json` or `globalConfig.yaml`. 
    A Splunkbase compatible version of SEMVER will be used by default.
* `-o` / `--output` - [optional] output folder to store the build add-on.
    By default, it will be saved in the `current directory/output` folder.
    Absolute paths are accepted as well.
* `--python-binary-name` - [optional] Python binary name to use when
    installing Python libraries. The default is `python3`.
* `-v` / `--verbose` - [optional] shows detailed information about
    created/copied/modified/conflict files after build is complete.
    This option is in experimental mode. The default is `False`.
* `--pip-version` - [optional] pip version that will be used to install python libraries. The default is `latest`.
* `--pip-legacy-resolver` - [optional] Use old pip dependency resolver by adding flag '--use-deprecated=legacy-resolver' 
  to pip install command. The default is`False`. NOTE: This flag is deprecated and will be removed from pip in the future.
Instead of using this flag, the correct solution would be to fix the packages your project depends on to work properly with the new resolver. Additionally, this flag is not compatible with pip version `23.2`. Use `23.2.1` instead. 

#### Verbose mode

Verbose mode is available for `v5.35.0` and up.

Running `ucc-gen build -v` or `ucc-gen build --verbose` prints additional information about
what was exactly created / copied / modified / conflicted after the build is complete. It does
not scan the `lib` folder due to the nature of the folder.

See the following explanation on what exactly each state means:

* `created`: The file is not in the original package and was created during the build process.
* `copied`: The file is in the original package and was copied during the build process.
* `modified`: The file is in the original package and was modified during the build process.
* `conflict`: The file is in the original package and was copied during the build process, but may be generated by UCC itself, so incorrect usage can stop the add-on from working. 

### `ucc-gen init`

`ucc-gen init` initializes the add-on. This is available on `v5.19.0` and up. 
The `ucc-gen init` command initializes the add-on and bootstraps some code in the 
modular input which you, as a developer, can extend for your needs.

Apart from standard files needed for the add-on, it also adds search head 
clustering files in the `default/server.conf` file and reload triggers in the
`default/app.conf` file. Those files will be soon by generated automatically by the
`ucc-gen build` command itself. For now, you need to include them manually 
during the add-on development.

It takes the following parameters:

* `--addon-name` - [required] add-on name. See the 
    [official naming convention guide](https://dev.splunk.com/enterprise/docs/releaseapps/splunkbase/namingguidelines/).
* `--addon-rest-root` - [optional] add-on REST root, defaults to `--addon-name` if not provided. 
* `--addon-display-name` - [required] add-on "official" name.
* `--addon-input-name` - [required] name of the generated input. 
* `--addon-version` - [optional] version of the generated add-on, with `0.0.1` by default.
* `--overwrite` - [optional] overwrites the already existing folder. 
    By default, you can't generate a new add-on to an already existing folder.

### `ucc-gen import-from-aob`

Import from AoB (Add-on Builder), from `v5.24.0` and up. It is in the
**experimental** state as of now, meaning that running this command may not
produce a 100% UCC compatible add-on, but we are going to work on future
improvements for the script itself.

> Note: the `import-from-aob` command does not currently support Windows.

The import functionality is based on the 
[ucc_migration_test](https://github.com/tmartin14/ucc_migration_test) bash
script.
One of the ways you can use it is to download an AoB-based add-on from
Splunkbase, unarchive the folder, and then use 
`ucc-gen import-from-aob --addon-name <unarchived-folder-name>`. Or you can
run the same command against your locally developed add-on, but it should be
exported from AoB.

It accepts the following parameters:

* `--addon-name` - [required] add-on name.

### `ucc-gen package`

`ucc-gen package` can be used for `v5.30.0` and up. It packages the add-on so it can be installed. 
It mimics the basics of the `slim package` command. This command can be used for most of the simple cases.

It does not support:

* the `.slimignore` file.
* the [dependencies section](https://dev.splunk.com/enterprise/docs/releaseapps/packageapps/packagingtoolkit/#Dependencies-section).

It accepts the following parameters:

* `--path` - [required] path to the built add-on (should include the `app.manifest` file).
* `-o` / `--output` - [optional] output folder to store the packaged add-on.
    By default, it will be saved in the `current directory` folder.
    It accepts absolute paths as well.

## `ucc-gen build`

`ucc-gen build`: 

* cleans the output folder.
* retrieves the package ID of the add-on.
* copies the UCC template directory under the `output/<package_ID>` directory.
* copies the globalConfig.json or the globalConfig.yaml file to
    the `output/<package_ID>/appserver/static/js/build` directory.
* collects and installs the add-on's requirements into the
    `output/<package_ID>/lib` directory of add-on's package.
* NOTE: For the add-on's requirements, the packages are installed according to
    following information: 
    * `lib/requirements.txt` installs Python3 compatible packages into
        the `output/<package_ID>/lib`.
    * It removes `setuptools*`, `bin*`, `pip*`, `distribute*`, and `wheel*` if 
        they exist from `output/<package_ID>/lib`
    * It removes the execute bit from every file under `output/<package_ID>/lib`.
* replaces tokens in views.
* copies the add-on's `package/*` to the `output/<package_ID>/*` directory.
* If an add-on requires some additional configurations in packaging,
    then `ucc-gen` runs the code in the `additional_packaging.py` file as well.
