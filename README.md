# SPDX-FileCopyrightText: 2020 Splunk Inc.

# splunk-add-on-ucc-framework

![PyPI](https://img.shields.io/pypi/v/splunk-add-on-ucc-framework)
![Python](https://img.shields.io/pypi/pyversions/splunk-add-on-ucc-framework.svg)

A framework to generate UI based Splunk Add-ons. It includes UI, Rest handler, Modular input, Oauth, Alert action templates.

> Note: after UCC 5.2 Python 2 specific libraries are not supported anymore.
> This means if the add-on has `package/lib/py2/requirements.txt` they will 
> not be installed while running `ucc-gen` command. Therefore modular inputs 
> that are supposed to run on Python 2 will not be supported by UCC. 

## What is UCC?

UCC stands for  Universal Configuration Console. It is a service for generating Splunk Add-ons which is easily customizable and flexible.
UCC provides basic UI template for creating Addon's UI. It is helpful to control the activity by using hooks and other functionalities.


## Features

- Generate UCC based addons for your Splunk Technology Add-ons

## UCC 5

UCC 5 has potentially breaking changes to add-ons using hook extension in the UX. Previously such hooks were limited to un-optimized js files placed in the package.
Add-ons may now package such extensions with webpack.

## Requirements

- Addon package and globalConfig.json file

> Note: You may refer the globalConfig.json file [here](https://github.com/splunk/addonfactory-ucc-generator/blob/master/tests/data/globalConfig.json)


## Installation

"splunk-add-on-ucc-framework" can be installed via `pip` from `PyPI`:

```bash
$ pip3 install splunk-add-on-ucc-framework
```

## How to use

To build the UCC based addon follow the below steps:

1. Install the `splunk-add-on-ucc-framework` via `pip3`.
2. Run the `ucc-gen` command.
3. Make sure that `package` folder and `globalConfig.json` file are present in the addon folder.
4. The final addon package will be generated, in the `output` folder.


## Workflow

By the running the `ucc-gen` command, the following steps are executed:
1. Cleaning out the `output` folder.
2. Retrieve the package ID of addon.
3. Copy UCC template directory under `output/<package_ID>` directory.
4. Copy `globalConfig.json` file to `output/<package_ID>/appserver/static/js/build` directory.
5. Collect and install Addon's requirements into `output/<package_ID>/lib` directory of addon's package.
6. For the addon's requirements, packages are installed according to following table:

    | File Name            | Description                         | Output directory in UCC build |
    |----------------------|-------------------------------------|-------------------------------|
    | lib/requirements.txt     | Python3 compatible packages | output/<package_ID>/lib   |

7. Replace tokens in views.
8. Copy addon's `package/*` to `output/<package_ID>/*` directory.
9. If an addon requires some additional configurations in packaging than implement the steps in additional_packaging.py

## Params

splunk-add-on-ucc-framework supports the following params:

| Name       | Description                                                                                              |
|------------|----------------------------------------------------------------------------------------------------------|
| source     | Folder containing the app.manifest and app source                                                        |
| config     | Path to the configuration file, Defaults to GlobalConfig.json in the parent directory of source provided |
| ta-version | Optional override Current version of TA, Default version is version specified in globalConfig.json a Splunkbase compatible version of SEMVER will be used by default                         |
