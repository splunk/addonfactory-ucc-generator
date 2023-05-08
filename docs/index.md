# Overview

`splunk-add-on-ucc-framework` is a framework to generate UI-based Splunk
Add-ons. It includes UI, REST handlers, Modular inputs, OAuth and Alert
action templates.

Only add-ons that use Python 3 are supported.

Available as a GitHub action here:
<https://github.com/splunk/addonfactory-ucc-generator-action>

You can use [Splunk Extension for VSCode](https://marketplace.visualstudio.com/items?itemName=Splunk.splunk) 
as well.

## What is UCC?

UCC stands for Universal Configuration Console. The purpose of having a
framework for add-on generation is to simplify the process of add-on
creation for the developers. UCC 5 uses [SplunkUI](https://splunkui.splunk.com/) 
which is a new UI framework based on React. UCC UI repository can be found
[here](https://github.com/splunk/addonfactory-ucc-base-ui).

UCC-based add-ons are being powered by another Splunk libraries:
[`solnlib`](https://github.com/splunk/addonfactory-solutions-library-python) and
[`splunktaucclib`](https://github.com/splunk/addonfactory-ucc-library). More
information [here](ucc_related_libraries.md).

## Features

* Generate UI (`appserver` folder)
* Generate Python REST handlers to support UI CRUD operations (`bin` folder)
* Generate OpenAPI description document (`static/openapi.json` file) (more info [here](openapi.md))
* Generate `.conf` files (more info [here](dot_conf_files.md))
* Install Python requirements (`lib` folder)
* Generate metadata files (`metadata` folder)
* Generate the monitoring dashboard (more info [here](dashboard.md)) 
* Possibility to extend UI with custom code (more info [here](custom_ui_extensions/custom_hook.md))
* Possibility to extend the build process via `additional_packaging.py` file (more info [here](additional_packaging.md))

## Installation

`splunk-add-on-ucc-framework` is available on [PyPI](https://pypi.org/project/splunk-add-on-ucc-framework/).

## Caveats

* Some specific Python libraries (like, `google-cloud-bigquery`) use `.so` files to operate and `pip` will install OS-specific versions of those `.so` files, which makes it impossible to use such add-on on Windows machine when it was built on macOS.
