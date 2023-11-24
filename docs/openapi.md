# OpenAPI description document

OpenAPI's description document is generated with `ucc-gen` command. 
There has to be defined valid `globalConfig.json` and `app.manifest` to have the document (`appserver/static/openapi.json` file) generated.

## How to find the document?

Once `ucc-gen` command is executed, OpenAPI description document is located in output `appserver/static` subdirectory.

One of ways is to download it via button displayed in top right corner of configuration page.

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

Make sure you clicked Authorize button, gave username and password and clicked Authorize

## How to generate Python client and use it?

### Prerequisites

* Docker running
* Python installed
* Splunk with your add-on installed

### Instruction

1. Create directory structure and open the `tmp` directory (run in terminal: `mkdir -p tmp/restapi_client ; mkdir -p tmp/generator ; cd tmp`)
2. Save your openapi.json file to the directory
3. Download the rest.mustache file (`wget https://raw.githubusercontent.com/swagger-api/swagger-codegen/master/modules/swagger-codegen/src/main/resources/python/rest.mustache`)
4. Splunk does not expect body for DELETE requests, so we need to revert modifications done for https://github.com/swagger-api/swagger-codegen/issues/9558 (`sed "s/request_body[[:blank:]]=[[:blank:]]\'{}\'/request_body = None/g" rest.mustache > generator/rest.mustache`).
If you want to understand exactly which line of rest.mustache is affected: https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/resources/python/rest.mustache#L150
5. Create client (`docker run --rm -v ${PWD}:/local swaggerapi/swagger-codegen-cli-v3 generate -i /local/openapi.json -l python -o /local/restapi_client -t /local/generator/`); it should appear in `restapi_client` directory
6. Open `restapi_client` directory and read `README.md` to find out the details of how the client should be installed, imported and used. (`cd restapi_client ; more README.md`)
7. Install the client (`python setup.py install --user`)
8. You can use below code as an inspiration for your own script that imports the client and uses for TA configuration
```
from __future__ import print_function
import os
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

def get_from_environment_variable(environment_variable: str) -> str:
    if environment_variable not in os.environ:
        print(40*'*')
        print(f"{environment_variable} environment variable not set")
        print("run below in terminal:")
        print(f"export {environment_variable}=[your value]")
        print(40*'*')
        exit(1)
    return os.environ[environment_variable]

configuration = swagger_client.Configuration()
configuration.host = configuration.host.replace('{domain}','localhost')
configuration.host = configuration.host.replace('{port}','8089')

configuration.verify_ssl = False
configuration.username = get_from_environment_variable("SPLUNK_USERNAME")
configuration.password = get_from_environment_variable("SPLUNK_PASSWORD")

api_instance = swagger_client.DefaultApi(swagger_client.ApiClient(configuration))

output_mode = 'json'
```

### Troubleshooting

* swaggerapi/swagger-codegen-cli-v3 docker image does not work on ARM platforms (eg. M-based Mac machines)