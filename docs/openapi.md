# OpenAPI description document

OpenAPI description document is generated with `ucc-gen` command. 
There has to be defined valid `globalConfi.json` and `app.manifest` to have the document (`static/openapi.json` file) generated.

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

* SSL certificate problem
Are you sure you added `-k` parameter to curl command?

* Unauthorized
Make sure you clicked Authorize button, gave username and password and clikced Authorize

## How to generate Python client and use it?

### Prerequisites

* docker running
* Splunk with your add-on installed

### Instruction

1. Create `tmp` directory and open it (`mkdir tmp ; cd tmp`)
2. Download the rest.mustache file (`wget https://raw.githubusercontent.com/swagger-api/swagger-codegen/master/modules/swagger-codegen/src/main/resources/python/rest.mustache`) and 

 https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/resources/python/rest.mustache#L150
Save openapi.json to the directory
3. 

### Troubleshooting

* Are you sure you 