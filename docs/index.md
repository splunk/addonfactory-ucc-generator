# Overview

`splunk-add-on-ucc-framework` is a framework to generate UI based Splunk
Add-ons. It includes UI, Rest handler, Modular input, Oauth, Alert
action templates.

> After UCC 5.2 Python 2 specific libraries are not supported anymore.
> This means if the add-on has package/lib/py2/requirements.txt they
> will not be installed while running ucc-gen command. Therefore,
> modular inputs that are supposed to run on Python 2 will not be
> supported by UCC.

Available as a GitHub action here:
<https://github.com/splunk/addonfactory-ucc-generator-action>

You can use [Splunk Extension for VSCode](https://marketplace.visualstudio.com/items?itemName=Splunk.splunk) 
as well.

## What is UCC?

UCC stands for Universal Configuration Console. The purpose of having a
framework for add-on generation is to simplify the process of add-on
creation for the developers. UCC 5 uses [SplunkUI](https://splunkui.splunk.com/) 
which is a new UI framework based on React.

## Features

* Generate UI (`appserver` folder)
* Generate Python REST handlers to support UI CRUD operations (`bin` folder)
* Generate OpenAPI description document (`static/openapi.json` file)
* Generate UI-related `.conf` files (`web.conf`, `restmap.conf`)
* Generate `README` folder (with `.conf.spec` files)
* Generate other `.conf` files (`inputs.conf`)
* Install Python requirements (`lib` folder)
* Generate metadata files (`metadata` folder)
* Possibility to extend UI with custom code
* Possibility to extend the build process via `additional_packaging.py` file

## Installation

`splunk-add-on-ucc-framework` is available on [PyPI](https://pypi.org/project/splunk-add-on-ucc-framework/).

## Caveats

* Some specific Python libraries (like, `google-cloud-bigquery`) use `.so` files to operate and `pip` will install OS-specific versions of those `.so` files, which makes it impossible to use such add-on on Windows machine when it was built on macOS.
