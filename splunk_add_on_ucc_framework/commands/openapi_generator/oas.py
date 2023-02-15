from typing import Any, Dict, List, Optional, Set
from dataclasses import dataclass
from splunk_add_on_ucc_framework.commands.openapi_generator.object_to_json import Init

# https://spec.openapis.org/oas/latest.html#data-types
# type	    format	    Comments
# integer	int32	    signed 32 bits
# integer	int64	    signed 64 bits (a.k.a long)
# number	float	
# number	double	
# string	password	A hint to UIs to obscure input.

OPENAPI_300 = "3.0.0"

@dataclass
class ServerVariableObject(Init): #   https://spec.openapis.org/oas/latest.html#server-variable-object
    # enum: Set[str]  #   cannot be empty    
    default: str    #   REQUIRED
    description: str = None

@dataclass
class ServerObject(Init): #   https://spec.openapis.org/oas/latest.html#server-object
    url: str
    variables: Dict[str,ServerVariableObject]
    description: str = None

@dataclass
class XMLObject(Init):  #   https://spec.openapis.org/oas/latest.html#xml-object
    name: str = None
    namespace: str = None
    prefix: str = None
    attribute: bool = False
    wrapped: bool = False

@dataclass
class SchemaObject(Init): #   https://spec.openapis.org/oas/latest.html#schema-object
    # discriminator	Discriminator Object
    # xml	XML Object
    # externalDocs	External Documentation Object
    # example	Any
    # above is a theory
    # below is practice
    type: str = None
    properties: dict = None
    items: Dict[str, str] = None
    xml: XMLObject = None

@dataclass
class ExampleObject(Init):
    pass

@dataclass
class EncodingObject(Init):
    pass

@dataclass
class MediaTypeObject(Init):  #   https://spec.openapis.org/oas/latest.html#media-type-object
    schema: SchemaObject = None
    example: Any = None
    examples: Dict[str, ExampleObject] = None
    encoding: Dict[str, EncodingObject] = None

@dataclass
class RequestBodyObject(Init):    #   https://spec.openapis.org/oas/latest.html#request-body-object
    content: Dict[str, MediaTypeObject]
    description: str = None
    required: bool = False

@dataclass
class ExternalDocumentationObject(Init):
    pass

@dataclass
class ParameterObject(Init):
    pass

@dataclass
class HeaderObject(Init):
    pass

@dataclass
class LinkObject(Init):
    pass

@dataclass
class ResponseObject(Init): #   https://spec.openapis.org/oas/latest.html#response-object
    description: str
    headers: Dict[str, HeaderObject] = None
    content: Dict[str, MediaTypeObject] = None
    links: Dict[str, LinkObject] = None

# @dataclass
# class ResponsesObject(Init):
#     pass

@dataclass
class CallbackObjects(Init):
    pass

# @dataclass
# class SecurityRequirementObject(Init):
#     pass

@dataclass
class OperationObject(Init):  #   https://spec.openapis.org/oas/latest.html#operation-object
    # responses: ResponsesObject = None
    responses: Dict[str,ResponseObject] #   required by openapi3
    tags: Set[str] = None
    summary: str = None
    description: str = None
    externalDocs:   ExternalDocumentationObject = None
    operationId: str = None
    parameters: ParameterObject = None
    requestBody: RequestBodyObject = None
    callbacks: CallbackObjects = None
    deprecated: bool = False
    # security: List[SecurityRequirementObject] = None
    security: List[dict] = None
    
    servers: ServerObject = None

@dataclass
class PathItemObject(Init):   #   https://spec.openapis.org/oas/latest.html#path-item-object
    _ref: str = None
    summary: str = None
    get: OperationObject = None
    # put: OperationObject = None
    post: OperationObject = None
    delete: OperationObject = None
    # options: OperationObject = None
    # head: OperationObject = None
    # patch: OperationObject = None
    # trace: OperationObject = None
    servers: ServerObject = None
    parameters: ParameterObject = None
    description: str = None
    

# @dataclass
# class PathsObject(Init):  #   https://spec.openapis.org/oas/latest.html#paths-object
#     pass
# not implementable

@dataclass
class ContactObject(Init):  #   https://spec.openapis.org/oas/latest.html#contact-object
    name: str = None
    url: str = None
    email: str = None

@dataclass
class LicenseObject(Init):  #   https://spec.openapis.org/oas/latest.html#licenseObject
    name: str
    identifier: str = None
    url: str = None

@dataclass
class InfoObject(Init): #   https://spec.openapis.org/oas/latest.html#infoObject
    title: str
    version: str
    summary: str = None
    description: str = None
    termsOfService: str = None
    contact: ContactObject = None
    license: LicenseObject = None

@dataclass
class ParameterObject(Init):
    pass

@dataclass
class SecuritySchemeObjects(Init):  #   https://spec.openapis.org/oas/latest.html#security-scheme-object
    type: str
    # name : str
    # in: str
    scheme: str
    # bearerFormat: str
    # flows: OAuthFlowsObject
    # openIdConnectUrl: str

@dataclass
class LinkObjects(Init):
    pass

@dataclass
class TagObject(Init):
    pass

@dataclass
class ComponentsObject(Init):   #   https://spec.openapis.org/oas/latest.html#components-object
    schemas: Dict[str,SchemaObject] = None
    responses: Dict[str, ResponseObject] = None
    parameters: Dict[str, ParameterObject] = None
    examples: Dict[str, ExampleObject] = None
    requestBodies: Dict[str, RequestBodyObject] = None
    headers: Dict[str, HeaderObject] = None
    securitySchemes: Dict[str, SecuritySchemeObjects] = None
    links: Dict[str, LinkObjects] = None
    callbacks: Dict[str, CallbackObjects] = None
    pathItems: Dict[str, PathItemObject] = None

@dataclass
class OpenAPIObject(Init):    #    https://spec.openapis.org/oas/latest.html#openapi-object
    openapi: str
    info: InfoObject
    jsonSchemaDialect: str = None
    servers: List[ServerObject] = None
    webhooks: Dict[str,PathItemObject] = None
    components: ComponentsObject = None
    tags: List[TagObject] = None
    externalDocs: ExternalDocumentationObject = None
    # paths: Optional[PathsObject] = None
    # security: List[SecurityRequirementObject] = None
    # despite above follows strict definition,
    # below needs to be used, to be implementable
    paths: Dict[str, PathItemObject] = None
    security: List[dict] = None