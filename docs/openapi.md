# OpenAPI description document

OpenAPI's description document is generated using the `ucc-gen` command. 
There has to be defined, valid `globalConfig.json` and `app.manifest` to have the document (`appserver/static/openapi.json` file) generated.

## How to find the document?

Once t`ucc-gen` command is executed, OpenAPI description document is located in the `appserver/static` output subdirectory.

One way to download it is through the button displayed on the top right corner of the configuration page.

When the add-on is installed to the Splunk instance, it is exposed via the web and management interface, so it is available under the following addresses:

* \[protocol\]://\[domain\]:\[port\]/en-GB/splunkd/__raw/servicesNS/\[user\]/\[appname\]/static/openapi.json

(for example, http://localhost:8000/en-GB/splunkd/__raw/servicesNS/admin/Splunk_TA_cisco_meraki/static/openapi.json)

* https://\[domain\]:\[port\]/servicesNS/\[user\]/\[appname\]/static/openapi.json

(for example, https://localhost:8089/servicesNS/admin/Splunk_TA_cisco_meraki/static/openapi.json)

All security rules are applied so that the user has to be authenticated and authorised to be able to have access to the document.

See the following resources for more information on working with the Splunk REST API (for example, how to authenticate):

* [REST API User Manual](http://docs.splunk.com/Documentation/Splunk/9.0.3/RESTUM/RESTusing)
* [REST API Tutorials](http://docs.splunk.com/Documentation/Splunk/9.0.3/RESTTUT/RESTconfigurations)

## Where can it be used?

The OpenAPI Description document can be used to create:

* interactive documentation that generates simple curl requests to all documented endpoints (check [this section](#how-to-get-curl-commands-and-use-them) for the relevant instructions).
* automation that uses the simple requests to create more complex solutions such as:
    * orchestration
    * mass load or migration
    * automated tests.

Check [swagger](https://swagger.io/) or [other tools](https://github.com/OAI/OpenAPI-Specification/blob/main/IMPLEMENTATIONS.md) for more possibilities.

## How to get curl commands and use them?

### Prerequisites

* docker running
* Splunk with your add-on installed

### Instructions

1. Run the following in the terminal: `docker run -p 8081:8080 swaggerapi/swagger-editor`.
2. Open SwaggerEditor in the web browser (http://localhost:8081/), and load the OpenAPI description document (File > Import file).
3. Check domain and port values for your Splunk instance and Authorize.
4. Select the method-path pair (for example, GET - /splunk_ta_snow_settings/logging ) and "Try it out".
5. Define the parameters and "Execute".
6. Copy the curl value, paste it to your terminal, ADD `-k` PARAMETER, and then run.

> See [Swagger Editor documentation](https://swagger.io/tools/swagger-editor/) for questions related to the tool.

### Troubleshooting

* SSL certificate problem

Make sure you added `-k` parameter to the curl command.

* Unauthorized

Make sure you clicked the Authorize button, gave the username and password, and then clicked Authorize.

## How do you generate Python client and then use it?

### Prerequisites

* Docker running
* Python installed
* Splunk with your add-on installed

### Instruction

1. Create the directory structure and open the `tmp` directory (run the following in the terminal: `mkdir -p tmp/restapi_client ; mkdir -p tmp/generator ; cd tmp`).
2. Save your openapi.json file to the directory.
3. Download the rest.mustache file (`wget https://raw.githubusercontent.com/swagger-api/swagger-codegen/master/modules/swagger-codegen/src/main/resources/python/rest.mustache`).
4. Splunk does not expect a body for DELETE requests, so we need to revert the modifications done for https://github.com/swagger-api/swagger-codegen/issues/9558 (`sed "s/request_body[[:blank:]]=[[:blank:]]\'{}\'/request_body = None/g" rest.mustache > generator/rest.mustache`).
If you want to understand exactly which line of rest.mustache is affected, see https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/resources/python/rest.mustache#L150. 
5. Create the client (`docker run --rm -v ${PWD}:/local swaggerapi/swagger-codegen-cli-v3 generate -i /local/openapi.json -l python -o /local/restapi_client -t /local/generator/`). It should appear in the `restapi_client` directory.
6. Open `restapi_client` directory and read `README.md` to find out the details of how the client should be installed, imported, and used. (`cd restapi_client ; more README.md`)
7. Install the client (`python setup.py install --user`).
8. You can use the following code as an inspiration for your own script, which imports the client and uses it for the add-on configuration:
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

* swaggerapi/swagger-codegen-cli-v3 docker image does not work on ARM platforms (for example, M-based Mac machines).
