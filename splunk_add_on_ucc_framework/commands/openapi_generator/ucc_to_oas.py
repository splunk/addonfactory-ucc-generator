#
# Copyright 2021 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import copy
from functools import lru_cache
from typing import List, Dict, Any, Optional, Union
from splunk_add_on_ucc_framework import global_config as global_config_lib
from splunk_add_on_ucc_framework import app_manifest as app_manifest_lib
from splunk_add_on_ucc_framework.commands.openapi_generator.oas import (
    OpenAPIObject,
)
from splunk_add_on_ucc_framework.commands.openapi_generator import oas, json_to_object
from splunk_add_on_ucc_framework.commands.openapi_generator.json_to_object import (
    DataClasses,
)


def __create_min_required(
    global_config: global_config_lib.GlobalConfig,
) -> OpenAPIObject:
    return OpenAPIObject(
        openapi=oas.OPENAPI_300,
        info=oas.InfoObject(title=global_config.product, version=global_config.version),
        paths={},
    )


def __add_info_object_details(
    open_api_object: OpenAPIObject,
    global_config: global_config_lib.GlobalConfig,
    app_manifest: app_manifest_lib.AppManifest,
) -> OpenAPIObject:
    open_api_object.info.description = global_config.display_name
    if app_manifest.get_license_name():
        open_api_object.info.license = oas.LicenseObject(
            name=app_manifest.get_license_name(), url=app_manifest.get_license_uri()
        )
    author = app_manifest.get_authors()[0]
    open_api_object.info.contact = oas.ContactObject(
        name=author["name"], email=author["email"]
    )
    return open_api_object


def __add_server_object(
    open_api_object: OpenAPIObject, global_config: global_config_lib.GlobalConfig
) -> OpenAPIObject:
    description = "Access via management interface"
    default_domain = "localhost"
    default_port = "8089"

    variables = {
        "domain": oas.ServerVariableObject(default=default_domain),
        "port": oas.ServerVariableObject(default=default_port),
    }
    server = oas.ServerObject(
        url=f"https://{{domain}}:{{port}}/servicesNS/-/{global_config.product}",
        description=description,
        variables=variables,
    )

    open_api_object.servers = [server]
    return open_api_object


def __add_security_scheme_object(open_api_object: OpenAPIObject) -> OpenAPIObject:
    if open_api_object.components is not None:
        open_api_object.components.securitySchemes = {
            "BasicAuth": oas.SecuritySchemeObjects(type="http", scheme="basic")
        }
    return open_api_object


def __get_schema_object(*, name: str, entities: list) -> oas.SchemaObject:
    schema_object = oas.SchemaObject(
        type="object", xml=oas.XMLObject(name=name), properties={}
    )
    for entity in entities:
        if "helpLink" == entity.type:
            continue
        if schema_object.properties is not None:
            schema_object.properties[entity.field] = {"type": "string"}
            if hasattr(entity, "options") and hasattr(
                entity.options, "autoCompleteFields"
            ):
                field_values = [
                    autoCompleteField.value
                    if hasattr(autoCompleteField, "value")
                    else None
                    for autoCompleteField in entity.options.autoCompleteFields
                ]
                from_children = [
                    child.value
                    for autocomplete_field in entity.options.autoCompleteFields
                    if hasattr(autocomplete_field, "children")
                    for child in autocomplete_field.children
                ]
                schema_object.properties[entity.field]["enum"] = (
                    field_values + from_children
                )
            if hasattr(entity, "encrypted") and entity.encrypted:
                schema_object.properties[entity.field]["format"] = "password"
    return schema_object


def __add_schemas_object(
    open_api_object: OpenAPIObject, global_config: DataClasses
) -> OpenAPIObject:
    if open_api_object.components is not None:
        open_api_object.components.schemas = {}
        for tab in global_config.pages.configuration.tabs:
            open_api_object.components.schemas[tab.name] = __get_schema_object(
                name=tab.name, entities=tab.entity
            )
        additional_input_entities = [
            json_to_object.DataClasses(
                json={
                    "field": "disabled",
                    "type": "singleSelect",
                    "options": {
                        "autoCompleteFields": [
                            {"value": "0"},
                            {"value": "1"},
                        ]
                    },
                }
            )
        ]
        if hasattr(global_config.pages, "inputs") and hasattr(
            global_config.pages.inputs, "services"
        ):
            for service in global_config.pages.inputs.services:
                open_api_object.components.schemas[service.name] = __get_schema_object(
                    name=service.name,
                    entities=service.entity + additional_input_entities,
                )
    return open_api_object


#   consider changing to 'cache' once python is upgraded to >=3.9
@lru_cache(maxsize=None)
def __get_media_type_object_with_schema_ref(
    *, schema_name: str, schema_type: Optional[str] = None, is_xml: bool = False
) -> oas.MediaTypeObject:
    ref_dict = {"$ref": f"#/components/schemas/{schema_name}"}
    schema: Union[oas.SchemaObject, Dict] = (
        oas.SchemaObject(
            type=schema_type,
            items=ref_dict,
            xml=oas.XMLObject(name=f"{schema_name}_list", wrapped=True)
            if is_xml
            else None,
        )
        if schema_type
        else ref_dict
    )
    return oas.MediaTypeObject(schema=schema)


def __get_path_get(
    *, name: str, description: str, schema_type: Optional[str] = None
) -> oas.OperationObject:
    return oas.OperationObject(
        description=description,
        responses={
            "200": oas.ResponseObject(
                description=description,
                content={
                    "application/json": __get_media_type_object_with_schema_ref(
                        schema_name=name, schema_type=schema_type
                    ),
                    "application/xml": __get_media_type_object_with_schema_ref(
                        schema_name=name, schema_type=schema_type, is_xml=True
                    ),
                },
            )
        },
    )


def __get_path_get_for_list(*, name: str) -> oas.OperationObject:
    description = f"Get list of items for {name}"
    return __get_path_get(name=name, description=description, schema_type="array")


def __get_path_get_for_item(*, name: str) -> oas.OperationObject:
    description = f"Get {name} item details"
    return __get_path_get(name=name, description=description)


def __get_path_post(*, name: str, description: str) -> oas.OperationObject:
    return oas.OperationObject(
        description=description,
        requestBody=oas.RequestBodyObject(
            content={
                "application/x-www-form-urlencoded": __get_media_type_object_with_schema_ref(
                    schema_name=name
                )
            }
        ),
        responses={
            "200": oas.ResponseObject(
                description=description,
                content={
                    "application/json": __get_media_type_object_with_schema_ref(
                        schema_name=name
                    ),
                    "application/xml": __get_media_type_object_with_schema_ref(
                        schema_name=name, is_xml=True
                    ),
                },
            )
        },
    )


def __get_path_post_for_create(*, name: str) -> oas.OperationObject:
    description = f"Create item in {name}"
    return __get_path_post(name=name, description=description)


def __get_path_post_for_update(*, name: str) -> oas.OperationObject:
    description = f"Update {name} item"
    return __get_path_post(name=name, description=description)


def __get_path_delete(*, name: str) -> oas.OperationObject:
    description = f"Delete {name} item"
    return oas.OperationObject(
        description=description,
        responses={
            "200": oas.ResponseObject(
                description=description,
                content={
                    "application/json": __get_media_type_object_with_schema_ref(
                        schema_name=name, schema_type="array"
                    ),
                    "application/xml": __get_media_type_object_with_schema_ref(
                        schema_name=name, schema_type="array", is_xml=True
                    ),
                },
            )
        },
    )


def __get_output_mode() -> Dict[str, Any]:
    return {
        "name": "output_mode",
        "in": "query",
        "required": False,
        "description": "The name of the item to operate on",
        "schema": {"type": "string", "enum": ["xml", "json"]},
    }


def __assign_ta_paths(
    *,
    open_api_object: OpenAPIObject,
    path: str,
    path_name: str,
    actions: List[str],
):
    if open_api_object.paths is not None:
        open_api_object.paths[path] = oas.PathItemObject(
            get=__get_path_get_for_list(name=path_name),
            post=__get_path_post_for_create(name=path_name),
        )
        open_api_object.paths[path].parameters = [
            __get_output_mode(),
        ]
        if actions is not None and "clone" in actions:
            path = f"{path}/{{name}}"
            open_api_object.paths[path] = oas.PathItemObject(
                get=__get_path_get_for_item(name=path_name),
                post=__get_path_post_for_update(name=path_name),
                delete=__get_path_delete(name=path_name)
                if "delete" in actions
                else None,
            )
            open_api_object.paths[path].parameters = [
                {
                    "name": "name",
                    "in": "path",
                    "required": True,
                    "description": "The name of the item to operate on",
                    "schema": {"type": "string"},
                },
                __get_output_mode(),
            ]
    return open_api_object


def __add_paths(
    open_api_object: OpenAPIObject, global_config: DataClasses
) -> OpenAPIObject:
    for tab in global_config.pages.configuration.tabs:
        open_api_object = __assign_ta_paths(
            open_api_object=open_api_object,
            path= f"/{global_config.meta.restRoot}_{tab.name}"
            if hasattr(tab, "table")
            else f"/{global_config.meta.restRoot}_settings/{tab.name}",
            path_name=tab.name,
            actions=tab.table.actions
            if hasattr(tab, "table") and hasattr(tab.table, "actions")
            else None,
        )
    if hasattr(global_config.pages, "inputs") and hasattr(
        global_config.pages.inputs, "services"
    ):
        for service in global_config.pages.inputs.services:
            open_api_object = __assign_ta_paths(
                open_api_object=open_api_object,
                path=f"/{global_config.meta.restRoot}_{service.name}",
                path_name=service.name,
                actions=global_config.pages.inputs.table.actions,
            )
    return open_api_object


def transform(
    global_config: global_config_lib.GlobalConfig,
    app_manifest: app_manifest_lib.AppManifest,
) -> OpenAPIObject:
    content_copy = copy.deepcopy(global_config.content)
    global_config_dot_notation = json_to_object.DataClasses(json=content_copy)

    open_api_object = __create_min_required(global_config)
    open_api_object = __add_info_object_details(
        open_api_object,
        global_config,
        app_manifest,
    )
    open_api_object = __add_server_object(open_api_object, global_config)
    open_api_object.components = oas.ComponentsObject()
    open_api_object = __add_security_scheme_object(open_api_object)
    open_api_object.security = [{"BasicAuth": []}]
    open_api_object = __add_schemas_object(open_api_object, global_config_dot_notation)
    open_api_object = __add_paths(open_api_object, global_config_dot_notation)
    return open_api_object
