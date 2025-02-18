# About UCC

Universal Configuration Console (UCC) is a framework that simplifies the process of add-on creation for developers. You can use UCC to generate UI-based Splunk add-ons. UCC includes UI, REST handlers, modular inputs, OAuth, and alert action templates.

The UCC framework helps you to maintain consistency and a uniform look and feel across different add-ons. You can easily update and modify your add-ons.

To work with UCC framework, you can also use Splunk Extension. It helps you to create, test, and debug the add-ons in a simple way. For more information, see [Visual Studio Code Extension for Splunk](https://marketplace.visualstudio.com/items?itemName=Splunk.splunk).

To see how UCC can be used in an add-on, see [Example TA](https://github.com/splunk/splunk-example-ta).

## Libraries

UCC-based add-ons are powered by the following Splunk libraries:

* `solnlib`, see [https://github.com/splunk/addonfactory-solutions-library-python](https://github.com/splunk/addonfactory-solutions-library-python)
* `splunktaucclib`, see [https://github.com/splunk/addonfactory-ucc-library](https://github.com/splunk/addonfactory-ucc-library).

For more information, see [UCC-related libraries](ucc_related_libraries.md).

> Note: Some specific Python libraries (such as `google-cloud-bigquery`) use `.so` files to operate. `pip` installs OS-specific versions of those `.so` files, which makes it impossible to use such add-ons on a Windows machine because it was built for macOS.

## What UCC generates

When you use UCC to create an add-on, the following elements are generated and stored in the appropriate folders:

* UI is stored in the `appserver` folder,
* Python REST handlers that support UI CRUD operations are stored in the `bin` folder,
* inputs and their helper modules. For more information, see [Inputs](./inputs/index.md) and [Helper modules](./inputs/helper.md),
* OpenAPI description documents are stored in the `appserver/static/openapi.json` file. For more information, see [OpenAPI description document](openapi.md),
* `.conf` files. For more information, see [.conf files](dot_conf_files.md),
* Python requirements are installed in the `lib` folder,
* metadata files are stored in the `metadata` folder,
* the monitoring dashboard. For more information, see [Dashboard](dashboard.md),
* the necessary files defined for the alert action, if you defined the alert action in the `globalConfig` file. For more information, see [Alert actions](alert_actions/index.md).

UCC now provides support for `.conf-only-TA's`, ensuring the following elements are generated and stored in their respective directories:

* `app.conf` is generated in the `default` directory.
* Metadata files are stored in the `metadata` folder.
* No Python or JavaScript files are created.

You can extend your add-ons with the following files:

* to extend the UI, use custom codes. For more information, see [Custom hook](custom_ui_extensions/custom_hook.md).
* to extend the build process, use the `additional_packaging.py` file. For more information, see [additional_packaging.py file](additional_packaging.md).
