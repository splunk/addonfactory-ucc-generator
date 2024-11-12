This is from the prerequisites section, the files are created by UCC

To be able to create an add-on using the UCC framework, you need to have at least: remove this list

* a `globalConfig` file (in `JSON` or `YAML` format, `JSON` is mostly used).
* a `package` folder.
* `app.manifest` file in the `package` folder ([documentation here](https://dev.splunk.com/enterprise/reference/packagingtoolkit/pkgtoolkitappmanifest/)). 

The `app.manifest` file now is being validated. See [Splunk Packaging Toolkit app.manifest schema definition](https://dev.splunk.com/enterprise/reference/packagingtoolkit/pkgtoolkitappmanifest/#JSON-schema-200) for more details.

> If both the globalConfig.json and globalConfig.yaml files are present, then the globalConfig.json file will take precedence.

The JSON schema for the `globalConfig` file can be found in the `splunk_add_on_ucc_framework/schema/schema.json` file.
