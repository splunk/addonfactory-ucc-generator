# splunk-add-on-ucc-framework

![PyPI](https://img.shields.io/pypi/v/splunk-add-on-ucc-framework)
![Python](https://img.shields.io/pypi/pyversions/splunk-add-on-ucc-framework.svg)

A framework to generate Splunk Add-ons. It includes UI, Rest handler, Modular input, Oauth, Alert action templates.

## What is UCC?

UCC is Universal Configuration Console. It is a service for Generating Splunk Add-ons which is easily customizable and flexible.
It helpful to control the activity by using hooks and other functionalities. UCC provides basic UI template for creating Addon's UI.


## Features

- Generate ucc based addons for your Splunk Technology Add-ons


## Requirements

- Addon package and globalConfig.json file

> Note: You may refer the globalConfig.json file [here](tests/data/globalConfig.json)


## Installation

You can install "splunk-add-on-ucc-framework" via `pip` from `PyPI`:

```bash
$ pip3 install splunk-add-on-ucc-framework
```


## How to use

To build the ucc based addon follow the below steps:

1. Install the `splunk-add-on-ucc-framework` via `pip3`
2. Run the `ucc-gen` command
3. Make sure that `package` directory and `globalConfig.json` file should present in current directory
4. The ultimate addon package will be generated, at `output` directory.


## Workflow

By the running the `ucc-gen` command, the following steps came in action:
1. Cleaning out the `output` directory
2. Retrieve the package ID of addon
3. Copy UCC template directory under `output/<package_ID>` directory
4. Copy `globalConfig.json` file to `output/<package_ID>/appserver/static/js/build` directory
5. Collect and install UCC Requirements into `output/<package_ID>/lib` directory of addon's package
6. Collect and install Addon's Requirements into `output/<package_ID>/lib` directory of addon's package
7. For the addon's requirements, packages were installed according to following table.

| File Name            | Description                         | Output directory in ucc build |
|----------------------|-------------------------------------|-------------------------------|
| requirements.txt     | Python2/python3 compatible packages | output/<package_ID>/lib       |
| requirements_py2.txt | Only Python2 compatible packages    | output/<package_ID>/lib/py2   |
| requirements_py3.txt | Only python3 compatible packages    | output/<package_ID>/lib/py3   |

8. Replace tokens in views
9. Copy addon's `package/*` to `output/<package_ID>/*` directory


## Params

splunk-add-on-ucc-framework supports the following params:
| Name       | Description                                                                                              |
|------------|----------------------------------------------------------------------------------------------------------|
| source     | Folder containing the app.manifest and app source                                                        |
| config     | Path to the configuration file, Defaults to GlobalConfig.json in the parent directory of source provided |
| ta-version | Current version of TA, Default version is version specified in globalConfig.json                         |