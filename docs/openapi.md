# OpenAPI description document

`ucc-gen` command is executed with `--openapi` argument enabled by default.
There have to be defined valid `globalConfi.json` and `app.manifest` to have OpenAPI description document (`static/openapi.json` file) generated.

To disable OpenAPI functionality for `ucc-gen` run, call it with `--openapi=0` argument.

## How to find the document?

Once `ucc-gen` command is executed, OpenAPI description document is located in output `static` subdirectory.

When add-on is installed to Splunk instance, it is exposed via web and management interface, so is available under following addresses accordingly:

* \[protocol\]://\[domain\]:\[port\]/en-GB/splunkd/__raw/servicesNS/\[user\]/\[appname\]/static/openapi.json

(eg. http://localhost:8000/en-GB/splunkd/__raw/servicesNS/admin/Splunk_TA_cisco_meraki/static/openapi.json)

* https://\[domain\]:\[port\]/servicesNS/\[user\]/\[appname\]/static/openapi.json

(eg. https://localhost:8089/servicesNS/admin/Splunk_TA_cisco_meraki/static/openapi.json)

All security rules are applied so user has to be authenticated and authorised to be able to have access to the document.

See the following resources for more information on working with the Splunk REST API (eg. how to authenticate):

* [REST API User Manual](http://docs.splunk.com/Documentation/Splunk/9.0.3/RESTUM/RESTusing)
* [REST API Tutorials](http://docs.splunk.com/Documentation/Splunk/9.0.3/RESTTUT/RESTconfigurations)

## Where it can be used?

OpenAPI Description document can be used to create:

* interactive documentation that generates simple curl requests to all documented endpoints (check [this section](#how-to-get-curl-commands-and-use-them) for relevant instruction)
* automation that uses the simple requests to create more complex solutions such as:
    * orchestration
    * mass load or migration
    * automated tests

Check [swagger](https://swagger.io/) or [other tools](https://github.com/OAI/OpenAPI-Specification/blob/main/IMPLEMENTATIONS.md) for more possibilities.

## How to get curl commands and use them?

### Prerequisites

* docker running
* Splunk with your add-on installed

### Instruction

1. Run in terminal: `docker run -p 8081:8080 swaggerapi/swagger-editor`
2. Open SwaggerEditor in web browser (http://localhost:8081/) and load the OpenAPI description document (File > Import file)
3. Check domain and port values for your Splunk instance and Authorize
4. Select method-path pair (eg. GET - /splunk_ta_snow_settings/logging ) and "Try it out"
5. Define parameters and "Execute"
6. Copy curl value, paste to your terminal, ADD `-k` PARAMETER, and run

> Note: Check [Swagger Editor documentation](https://swagger.io/tools/swagger-editor/) in case of any question related to the tool

### Troubleshooting

Are you sure you added `-k` parameter to curl command?