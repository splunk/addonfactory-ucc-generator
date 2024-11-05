#
# Copyright 2024 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from typing import Any, Dict, List, Set, Optional, Union
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
class ServerVariableObject(
    Init
):  # https://spec.openapis.org/oas/latest.html#server-variable-object
    # enum: Set[str]  # cannot be empty
    default: str  # REQUIRED
    description: Optional[str] = None


@dataclass
class ServerObject(Init):  # https://spec.openapis.org/oas/latest.html#server-object
    url: str
    variables: Dict[str, ServerVariableObject]
    description: Optional[str] = None


@dataclass
class SchemaObject(Init):  # https://spec.openapis.org/oas/latest.html#schema-object
    # discriminator	Discriminator Object
    # externalDocs	External Documentation Object
    # example	Any
    # above is a theory
    # below is practice
    type: Optional[str] = None
    properties: Optional[Dict[str, Any]] = None
    items: Optional[Dict[str, str]] = None


@dataclass
class ExampleObject(Init):
    pass


@dataclass
class EncodingObject(Init):
    pass


@dataclass
class MediaTypeObject(
    Init
):  # https://spec.openapis.org/oas/latest.html#media-type-object
    schema: Optional[Union[SchemaObject, Dict[str, str]]] = None
    example: Optional[Any] = None
    examples: Optional[Dict[str, ExampleObject]] = None
    encoding: Optional[Dict[str, EncodingObject]] = None


@dataclass
class RequestBodyObject(
    Init
):  # https://spec.openapis.org/oas/latest.html#request-body-object
    content: Dict[str, Union[MediaTypeObject, Dict[str, Any]]]
    description: Optional[str] = None
    required: Optional[bool] = False


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
class ResponseObject(Init):  # https://spec.openapis.org/oas/latest.html#response-object
    description: str
    headers: Optional[Dict[str, HeaderObject]] = None
    content: Optional[Dict[str, MediaTypeObject]] = None
    links: Optional[Dict[str, LinkObject]] = None


# @dataclass
# class ResponsesObject(Init):
#   pass


@dataclass
class CallbackObjects(Init):
    pass


# @dataclass
# class SecurityRequirementObject(Init):
#   pass


@dataclass
class OperationObject(
    Init
):  # https://spec.openapis.org/oas/latest.html#operation-object
    # responses: ResponsesObject = None
    responses: Dict[str, ResponseObject]  # required by openapi3
    tags: Optional[Set[str]] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    externalDocs: Optional[ExternalDocumentationObject] = None
    operationId: Optional[str] = None
    parameters: Optional[ParameterObject] = None
    requestBody: Optional[RequestBodyObject] = None
    callbacks: Optional[CallbackObjects] = None
    deprecated: Optional[bool] = False
    # security: List[SecurityRequirementObject] = None
    security: Optional[List[Dict[str, Any]]] = None

    servers: Optional[ServerObject] = None


@dataclass
class PathItemObject(
    Init
):  # https://spec.openapis.org/oas/latest.html#path-item-object
    _ref: Optional[str] = None
    summary: Optional[str] = None
    get: Optional[OperationObject] = None
    # put: OperationObject = None
    post: Optional[OperationObject] = None
    delete: Optional[OperationObject] = None
    # options: OperationObject = None
    # head: OperationObject = None
    # patch: OperationObject = None
    # trace: OperationObject = None
    servers: Optional[ServerObject] = None
    parameters: Optional[List[Dict[str, Any]]] = None
    description: Optional[str] = None


# @dataclass
# class PathsObject(Init):  # https://spec.openapis.org/oas/latest.html#paths-object
#   pass
# not implementable


@dataclass
class ContactObject(Init):  # https://spec.openapis.org/oas/latest.html#contact-object
    name: Optional[str] = None
    url: Optional[str] = None
    email: Optional[str] = None


@dataclass
class LicenseObject(Init):  # https://spec.openapis.org/oas/latest.html#licenseObject
    name: str
    identifier: Optional[str] = None
    url: Optional[str] = None


@dataclass
class InfoObject(Init):  # https://spec.openapis.org/oas/latest.html#infoObject
    title: str
    version: str
    summary: Optional[str] = None
    description: Optional[str] = None
    termsOfService: Optional[str] = None
    contact: Optional[ContactObject] = None
    license: Optional[LicenseObject] = None


@dataclass
class SecuritySchemeObjects(
    Init
):  # https://spec.openapis.org/oas/latest.html#security-scheme-object
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
class ComponentsObject(
    Init
):  # https://spec.openapis.org/oas/latest.html#components-object
    schemas: Optional[Dict[str, SchemaObject]] = None
    responses: Optional[Dict[str, ResponseObject]] = None
    parameters: Optional[Dict[str, ParameterObject]] = None
    examples: Optional[Dict[str, ExampleObject]] = None
    requestBodies: Optional[Dict[str, RequestBodyObject]] = None
    headers: Optional[Dict[str, HeaderObject]] = None
    securitySchemes: Optional[Dict[str, SecuritySchemeObjects]] = None
    links: Optional[Dict[str, LinkObjects]] = None
    callbacks: Optional[Dict[str, CallbackObjects]] = None
    pathItems: Optional[Dict[str, PathItemObject]] = None


@dataclass
class OpenAPIObject(Init):  # https://spec.openapis.org/oas/latest.html#openapi-object
    openapi: str
    info: InfoObject
    jsonSchemaDialect: Optional[str] = None
    servers: Optional[List[ServerObject]] = None
    webhooks: Optional[Dict[str, PathItemObject]] = None
    components: Optional[ComponentsObject] = None
    tags: Optional[List[TagObject]] = None
    externalDocs: Optional[ExternalDocumentationObject] = None
    # paths: Optional[PathsObject] = None
    # security: List[SecurityRequirementObject] = None
    # despite above follows strict definition,
    # below needs to be used, to be implementable
    paths: Optional[Dict[str, PathItemObject]] = None
    security: Optional[List[Dict[str, Any]]] = None
