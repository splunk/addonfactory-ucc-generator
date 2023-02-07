import json as json_lib
from openapi3 import OpenAPI
from splunk_add_on_ucc_framework.commands.openapi_generator import oas
from splunk_add_on_ucc_framework.commands.openapi_generator.oas import OpenAPIObject,ServerObject,ServerVariableObject,InfoObject
from splunk_add_on_ucc_framework.commands.openapi_generator import json_to_object

class TestOAS:
    
    class MinOpenAPI(object):
        
        @property
        def title(self) -> str:
            return "Splunk_TA_Acme"
        
        @property
        def version(self) -> str:
            return "1.2.3"
        
        @property
        def open_api_object(self) -> OpenAPIObject:
            return OpenAPIObject(
                openapi=oas.OPENAPI_300,
                info=InfoObject(
                    title=self.title,
                    version=self.version
                ),
                paths={}
            )
        
    def test_min_openapi(self, tmp_path):

        min_open_api = self.MinOpenAPI()
        open_api_object = min_open_api.open_api_object
        j = open_api_object.json
        open_api = OpenAPI(j)
        
        p = tmp_path / 'openapi.json'
        with open(p, "w") as f:
            json_lib.dump(open_api.raw_element, f, indent=4)
        dc = json_to_object.DataClasses(json_path=p)
        assert dc.openapi==oas.OPENAPI_300
        assert dc.info.title == min_open_api.title
        assert dc.info.version == min_open_api.version
        
    def test_servers(self):
        min_open_api = self.MinOpenAPI()
        open_api_object = min_open_api.open_api_object
        description = "Access via management interface"
        default_domain = "localhost"
        
        variables = {}
        variables["domain"]=ServerVariableObject(default=default_domain)
        variables["port"]=ServerVariableObject(default="8089")
        server = ServerObject(
            url="https://{domain}:{port}/servicesNS/-/Splunk_TA_Acme",
            description=description,
            variables=variables)        
        
        open_api_object.servers = [server]
        j = open_api_object.json
        assert j['openapi']==oas.OPENAPI_300
        assert j['servers'][0]['description'] == description
        assert j['servers'][0]['variables']['domain']['default']==default_domain

    def test_info(self):
        min_open_api = self.MinOpenAPI()
        open_api_object = min_open_api.open_api_object
    
        info_title = "Info title"
        info_version = "1.3.0b52f0112"
        license_name = "Splunk Software License Agreement"
        license_url = "http://www.splunk.com/view/SP-CAAAAFA"
        contact_name =  "Splunk, Inc."
        contact_email = "support@splunk.com"

        info = oas.InfoObject(
            title=info_title,
            version=info_version,
            license=oas.LicenseObject(
                name=license_name,
                url=license_url
            ),
            contact=oas.ContactObject(
                name=contact_name,
                email=contact_email
            )
        )
        
        open_api_object.info = info
        j = open_api_object.json
        assert j['openapi']==oas.OPENAPI_300
        assert j['info']['title'] == info_title
        assert j['info']['version'] == info_version
        assert j['info']['license']['name'] == license_name
        assert j['info']['license']['url'] == license_url
        assert j['info']['contact']['name'] == contact_name
        assert j['info']['contact']['email'] == contact_email
        
    def test_components(self):
        min_open_api = self.MinOpenAPI()
        open_api_object = min_open_api.open_api_object

        logging = "logging"
        basic_auth = "BasicAuth"
        http = "http"
        basic = "basic"
        object = "object"

        components = oas.ComponentsObject(
            schemas={logging : oas.SchemaObject(
                type = object,
                properties = {
                        "loglevel": {
                            "type": "string",
                            "enum": [
                                "DEBUG",
                                "INFO",
                                "WARNING",
                                "ERROR",
                                "CRITICAL"
                            ]
                        }
                    }
            )},
            securitySchemes = {basic_auth : oas.SecuritySchemeObjects(
                type=http,
                scheme=basic
            )}
        )

        open_api_object.components = components

        j = open_api_object.json
        open_api = OpenAPI(j)
        assert j['openapi']==oas.OPENAPI_300
        assert j['components']['schemas'][logging]['type'] == object
        assert j['components']['securitySchemes'][basic_auth]['type'] == http
        assert j['components']['securitySchemes'][basic_auth]['scheme'] == basic
 
    def test_paths_get(self):
        min_open_api = self.MinOpenAPI()
        open_api_object = min_open_api.open_api_object

        logging = "logging"
        basic_auth = "BasicAuth"
        http = "http"
        basic = "basic"
        object = "object"

        components = oas.ComponentsObject(
            schemas={logging : oas.SchemaObject(
                type = object,
                properties = {
                        "loglevel": {
                            "type": "string",
                            "enum": [
                                "DEBUG",
                                "INFO",
                                "WARNING",
                                "ERROR",
                                "CRITICAL"
                            ]
                        }
                    }
            )},
            securitySchemes = {basic_auth : oas.SecuritySchemeObjects(
                type=http,
                scheme=basic
            )}
        )
        
        path_settings_logging = "/splunk_ta_acme_settings/logging"
        path_settings_logging_get_description = "Get logging details"
        paths = {
            path_settings_logging : oas.PathItemObject(
                get=oas.OperationObject(
                    description=path_settings_logging_get_description,
                    responses={
                        "200": oas.ResponseObject(
                            description=path_settings_logging_get_description
                        )
                    }
                )
            )
        }
        security = [
                    {
                        basic_auth: []
                    }
                ]

        open_api_object.components = components
        open_api_object.paths = paths
        open_api_object.security = security

        j = open_api_object.json
        open_api = OpenAPI(j)
        assert j['openapi']==oas.OPENAPI_300
        assert j['components']['schemas'][logging]['type'] == object
        assert j['components']['securitySchemes'][basic_auth]['type'] == http
        assert j['components']['securitySchemes'][basic_auth]['scheme'] == basic
        assert j['paths'][path_settings_logging]['get']['description'] == path_settings_logging_get_description
        assert j['paths'][path_settings_logging]['get']['responses']['200']['description'] == path_settings_logging_get_description
        assert j['security'][0][basic_auth] == []
        assert open_api.paths[path_settings_logging].get.security[0].name == basic_auth #   conceptually, root level security is populated down
         
    def test_paths_post(self):
        min_open_api = self.MinOpenAPI()
        open_api_object = min_open_api.open_api_object

        logging = "logging"
        basic_auth = "BasicAuth"
        http = "http"
        basic = "basic"
        object = "object"

        components = oas.ComponentsObject(
            schemas={logging : oas.SchemaObject(
                type = object,
                properties = {
                        "loglevel": {
                            "type": "string",
                            "enum": [
                                "DEBUG",
                                "INFO",
                                "WARNING",
                                "ERROR",
                                "CRITICAL"
                            ]
                        }
                    }
            )},
            securitySchemes = {basic_auth : oas.SecuritySchemeObjects(
                type=http,
                scheme=basic
            )}
        )
        
        path_settings_logging = "/splunk_ta_acme_settings/logging"
        path_settings_logging_post_description = "Update logging details"
        media_type_application_x_www_form_urlencoded = "application/x-www-form-urlencoded"
        request_body_content = {
                                "schema": {
                                    "$ref": "#/components/schemas/logging"
                                }
                            }
        paths = {
            path_settings_logging : oas.PathItemObject(
                post=oas.OperationObject(
                    description=path_settings_logging_post_description,
                    requestBody=oas.RequestBodyObject(
                        content={
                            media_type_application_x_www_form_urlencoded:request_body_content
                        }
                        ),
                    responses={
                        "200": oas.ResponseObject(
                            description=path_settings_logging_post_description
                        )
                    }
                )
            )
        }

        open_api_object.components = components
        open_api_object.paths = paths
        open_api_object.security = [{basic_auth: []}]

        j = open_api_object.json
        open_api = OpenAPI(j)
        assert j['paths'][path_settings_logging]['post']['requestBody']['content'][media_type_application_x_www_form_urlencoded] == request_body_content
