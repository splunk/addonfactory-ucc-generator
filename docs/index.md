# About UCC

Universal Configuration Console (UCC) is a fremawerk that simplifys the process of add-on creation for developers.You can use UCC to generate UI-based Splunk add-ons. UCC includes UI, REST handlers, Modular inputs, OAuth, and alert action templates.

The UCC framework helps you to maintain consistency and a uniform look and feel across different add-ons. You can easily update and modify to your add-ons.

UCC 5 <!--- why do we say 5, everywhere else we say UCC---> uses Splunk UI. See [Splunk UI](https://splunkui.splunk.com/). It is a new UI framework based on React. The UCC UI repository is stored in the `ui` folder. <!-- (but where is this folder exactly, when I install Splunk UI?) -->

> The UCC framework supports add-ons that use only Python 3.

The UCC framework is available as a GitHub action. See <https://github.com/splunk/addonfactory-ucc-generator-action>.

To work with UCC framework, you can also use Splunk Extension. It helps you to create, test ,and debug the add-ons in a simple way. For more information, see [Visual Studio Code Extension for Splunk](https://marketplace.visualstudio.com/items?itemName=Splunk.splunk).

## Libraries

UCC-based add-ons are powered by the following Splunk libraries:
* `solnlib`, see [https://github.com/splunk/addonfactory-solutions-library-python](https://github.com/splunk/addonfactory-solutions-library-python)
* `splunktaucclib`, see [https://github.com/splunk/addonfactory-ucc-library](https://github.com/splunk/addonfactory-ucc-library). 
For more information, see [UCC-related libraries](ucc_related_libraries.md).

## What UCC generates 

When you use UCC to create an add-on, the following elements are generated and stored in the appriopriate folders: 

* UI is stored in the `appserver` folder,
* Python REST handlers that support UI CRUD operations are stored in the `bin` folder,
* inputs and their helper modules. For more information, see [Inputs](./inputs/index.md) and [Helper modules](./inputs/helper.md),
* OpenAPI description documents are stored in the `appserver/static/openapi.json` file. For more information, see [OpenAPI description document](openapi.md),
* `.conf` files. For more information, see [.conf files](dot_conf_files.md),
* Python requirements are installed in the `lib` folder,
* metadata files are stored in the `metadata` folder,
* the monitoring dashboard. For more information, see [Dashboard](dashboard.md),
* the necessary files defined for the alert action <!---who defines the files? can I rewrite to: the files defined for the alert action?, is this part of the basic version or an extended one? --->, if the alert action is defined in globalConfig <!--- is this a file name? --->. For more informaiton, see [Alert actions](alert_actions/index.md). 

You can extend your add-ons with the following files:

* to extend the UI, use custom codes. For more information, see [Custom hook](custom_ui_extensions/custom_hook.md).
* to extend the build process, use the `additional_packaging.py` file. For more information, see [additional_packaging.py file](additional_packaging.md).