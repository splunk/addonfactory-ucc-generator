# Commands

These are the commands that are available in UCC framework.

## `ucc-gen build`

The `ucc-gen build` command builds the add-on. As of now, running `ucc-gen` does the same thing as running `ucc-gen build`,
but eventually calling `ucc-gen` without specifying a subcommand will be
deprecated.

It takes the following parameters:

* `--source` - [optional] folder containing the `app.manifest` and app
    source. The default is `package`.
* `--config` - [optional] path to the configuration file. It defaults to
    the globalConfig file in the parent directory of the source provided.
    Only *.json* and *.yaml* files are accepted.
* `--ta-version` - [optional] override current version of TA. The default
    version is version specified in `globalConfig.json` or `globalConfig.yaml`.
    A Splunkbase compatible version of SEMVER is used by default.
* `-o` / `--output` - [optional] output folder to store the build add-on.
   By default, it is saved in the `current directory/output` folder.
    Absolute paths are accepted as well.
* `--python-binary-name` - [optional] Python binary name to use when
    installing Python libraries. The default is `python3`.
* `-v` / `--verbose` - [optional] shows detailed information about
    created/copied/modified/conflict files after build is complete.
    This option is in the experimental mode. The default is `False`.
* `--pip-version` - [optional] pip version that is used to install python libraries. The default is `latest`.
* `--pip-legacy-resolver` - [optional] Use old pip dependency resolver by adding flag '--use-deprecated=legacy-resolver'
    to pip install command. The default is`False`.
    </br> **NOTE:** This flag is **deprecated** and will be removed from pip in the future.
    Instead of using this flag, the correct solution would be to fix the packages your project depends on to work properly with the new resolver. Additionally, this flag is not compatible with pip version `23.2`. Use `23.2.1` instead.
* `--pip-custom-flag` - [optional] Additional flag(s) that will be added to the `pip install` command.
    By default, all the following flags are added to the `pip install` command: `--no-compile`, `--prefer-binary` and `--ignore-installed`.
    If `--pip-custom-flag` is specified these three arguments will be missing so if you still want them in your command add them to the `--pip-custom-flag` argument.

    Example:  `--pip-custom-flag="--no-compile --prefer-binary --ignore-installed --report path/to/report.json --progress-bar on"`

* `--ui-source-map` - [optional] if present generates front-end source maps (.js.map files), that helps with code debugging. </br> **NOTE:** The '--ui-source-map' parameter is deprecated and is scheduled for removal on 3rd June 2025. It is recommended to discontinue using this parameter.

!!! warning "Deprecation --ui-source-map"

    The `--ui-source-map` parameter is deprecated and is scheduled for removal on 3rd June 2025. It is recommended to discontinue using this parameter.


### Verbose mode

The verbose mode is available for `v5.35.0` and later.

Running `ucc-gen build -v` or `ucc-gen build --verbose` prints additional information about
what was exactly created / copied / modified / conflicted after the build is complete. It does
not scan the `lib` folder due to the nature of the folder.

See the following description of what each state means:

* `created`: the file is not in the original package and was created during the build process.
* `copied`: the file is in the original package and was copied during the build process.
* `modified`: the file is in the original package and was modified during the build process.
* `conflict`: the file is in the original package and was copied during the build process, but may be generated by UCC itself, so incorrect usage can stop the add-on from working.

## `ucc-gen init`

`ucc-gen init` initializes the add-on. This is available on `v5.19.0` and later.
The `ucc-gen init` command initializes the add-on and bootstraps some code in the
modular input which you, as a developer, can extend for your needs.

Apart from standard files needed for the add-on, it also adds search head
clustering files in the `default/server.conf` file and reload triggers in the
`default/app.conf` file. Those files will be soon generated automatically by the
`ucc-gen build` command itself.
during the add-on development.

It takes the following parameters:

* `--addon-name` - [required] add-on name. See the
    [official naming convention guide](https://dev.splunk.com/enterprise/docs/releaseapps/splunkbase/namingguidelines/).
* `--addon-rest-root` - [optional] add-on REST root, defaults to `--addon-name` if not provided.
* `--addon-display-name` - [required] add-on "official" name.
* `--addon-input-name` - [required] name of the generated input.
* `--addon-version` - [optional] version of the generated add-on, with `0.0.1` by default.
* `--overwrite` - [optional] overwrites the already existing folder. By default, you can't generate a new add-on to an already existing folder.
* `--add-license` - [optional] Adds license agreement such as [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt), [MIT License](https://mit-license.org/), or
[SPLUNK PRE-RELEASE SOFTWARE LICENSE AGREEMENT](https://www.splunk.com/en_us/legal/splunk-pre-release-software-license-agreement.html) in your `package/LICENSES` directory. If not mentioned an empty License.txt will be generated.
* `--include-author` - [optional] Allows you to specify the author of the add-on during initialization. The author's name will appear in `app.manifest` under `info -> author -> name` and in `app.conf` (after building your add-on) under `launcher -> author` field.

> **Note:** The add-on will not build if the input for `--add-license` is not one of the following: `Apache License 2.0`, `MIT License`, or `SPLUNK PRE-RELEASE SOFTWARE LICENSE AGREEMENT`. If you want to keep another license in your add-on, place it in `package/LICENSES` directory and it will be shipped

## `ucc-gen import-from-aob`

Import from AoB (Add-on Builder), from `v5.24.0` and later. It is in the
**experimental** state as of now, meaning that running this command may not
produce a 100% UCC compatible add-on, but we are going to work on future
improvements for the script itself.

> **Note:** the `import-from-aob` command does not currently support Windows.

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

## `ucc-gen package`

`ucc-gen package` can be used for `v5.30.0` and later. It packages the add-on so it can be installed.
It mimics the basics of the `slim package` command. This command can be used for most of the simple cases.

It does not support:

* the `.slimignore` file.
* the [dependencies section](https://dev.splunk.com/enterprise/docs/releaseapps/packageapps/packagingtoolkit/#Dependencies-section).

It accepts the following parameters:

* `--path` - [required] path to the built add-on (should include the `app.manifest` file).
* `-o` / `--output` - [optional] output folder to store the packaged add-on.
    By default, it will be saved in the `current directory` folder.
    It accepts absolute paths as well.
