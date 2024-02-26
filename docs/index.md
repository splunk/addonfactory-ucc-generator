# Overview

`splunk-add-on-ucc-framework` is a framework to generate UI-based Splunk
add-ons. It includes UI, REST handlers, Modular inputs, OAuth and Alert
action templates.

Only add-ons that use Python 3 are supported.

It is available as a GitHub action here:
<https://github.com/splunk/addonfactory-ucc-generator-action>

You can use [Splunk Extension for VSCode](https://marketplace.visualstudio.com/items?itemName=Splunk.splunk) 
as well.

## What is UCC?

UCC stands for Universal Configuration Console. The purpose of having a
framework for add-on generation is to simplify the process of add-on
creation for developers. UCC 5 uses [SplunkUI](https://splunkui.splunk.com/),
which is a new UI framework based on React. The UCC UI repository can be found in the `ui` folder.

UCC-based add-ons are being powered by Splunk libraries:
[`solnlib`](https://github.com/splunk/addonfactory-solutions-library-python) and
[`splunktaucclib`](https://github.com/splunk/addonfactory-ucc-library). More
information [here](ucc_related_libraries.md).

## Features

The `splunk-add-on-ucc-framework`:

* generates UI (`appserver` folder).
* generates Python REST handlers to support UI CRUD operations (`bin` folder).
* generates OpenAPI description documents (`appserver/static/openapi.json` file) (for more information, see [here](openapi.md)).
* generates `.conf` files (more information, see [here](dot_conf_files.md)).
* installs Python requirements (`lib` folder).
* generate metadata files (`metadata` folder).
* generates the monitoring dashboard (for more information, see [here](dashboard.md)).
* it possibly extends the UI with custom codes (for more information, see [here](custom_ui_extensions/custom_hook.md)).
* it possibly extends the build process via a `additional_packaging.py` file (more information, [here](additional_packaging.md)).

## Installation

`splunk-add-on-ucc-framework` is available on [PyPI](https://pypi.org/project/splunk-add-on-ucc-framework/).

## Caveats

* Some specific Python libraries (such as `google-cloud-bigquery`) use `.so` files to operate. `pip` will install OS-specific versions of those `.so` files, which makes it impossible to use such add-ons on a Windows machine since it was built for macOS.
