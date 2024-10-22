# Overview

Universal Configuration Console (UCC) is a framework used to generate UI-based Splunk
add-ons. It includes UI, REST handlers, Modular inputs, OAuth, and Alert
action templates.

The UCC framework is designed for Splunk users and developers to facilitate the development and management of add-ons. Whether you're an experienced Splunk expert or just starting your journey with our platform, UCC offers a standardized, efficient way to create add-ons with rich user interfaces and robust functionality.
<!---(use the name of this framework consistently, what is the official name anyway?) --->
The UCC framework provides consistency, ensure a uniform look and feel across different add-ons. Simplifys updates and modifications to your add-ons.

The UCC framework supports add-ons that use only Python 3.

The UCC framework is available as a GitHub action. See <https://github.com/splunk/addonfactory-ucc-generator-action>.

To work with UCC framework, you can also use Splunk Extension. See [Visual Studio Code Extension for Splunk](https://marketplace.visualstudio.com/items?itemName=Splunk.splunk).

## What is UCC

UCC is a framework that simplifys the process of add-on
creation for developers. UCC 5 <!--- why do we say 5, everywhere else we say UCC---> uses Splunk UI. See [Splunk UI](https://splunkui.splunk.com/). It
 is a new UI framework based on React. The UCC UI repository is stored in the `ui` folder. <!-- (but where is this folder exactly, when I install Splunk UI?) -->

UCC-based add-ons are powered by the following Splunk libraries:
* `solnlib`, see (https://github.com/splunk/addonfactory-solutions-library-python)
* `splunktaucclib`, see (https://github.com/splunk/addonfactory-ucc-library). 
For more information, read [UCC-related libraries](ucc_related_libraries.md).

## Features <!--- change this heading to sth more appropriate, these are not features>

UCC does the following:
UCC generates the following elements/components that are stored in the listed/dedicated/separate folders:
When you use UCC to create an add-on, the following components are generated and stored in the appriopriate folders:

* the generated UI is stored in the `appserver` folder.
* Python REST handlers that support UI CRUD operations are stored in the `bin` folder.
* inputs and their helper modules. For more information, see [Inputs](./inputs/index.md) and [Helper modules].(/inputs/helper.md).
* OpenAPI description documents are stored in the `appserver/static/openapi.json` file. For more information, see [OpenAPI description document](openapi.md).
* `.conf` files. For more information, see [.conf files](dot_conf_files.md).
* Python requirements are installed in the `lib` folder.
* metadata files are stored in the `metadata` folder.
* the monitoring dashboard. For more information, see [Dashboard](dashboard.md).
* it possibly extends the UI with custom codes (for more information, see [here](custom_ui_extensions/custom_hook.md)).
* it possibly extends the build process via a `additional_packaging.py` file (more information, [here](additional_packaging.md)).
* generates the necessary files defined for the Alert Action, if defined in globalConfig (for more informaiton, see [here](alert_actions/index.md)).

## Installation <!--- I'd move this to Quick start chapter>

`splunk-add-on-ucc-framework` is available on [PyPI](https://pypi.org/project/splunk-add-on-ucc-framework/).

## Caveats

* Some specific Python libraries (such as `google-cloud-bigquery`) use `.so` files to operate. `pip` will install OS-specific versions of those `.so` files, which makes it impossible to use such add-ons on a Windows machine since it was built for macOS.
