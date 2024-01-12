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
import copy
from enum import Flag, auto
from functools import lru_cache
from typing import List, Tuple, Dict, Any, Optional
from splunk_add_on_ucc_framework import global_config as global_config_lib
from splunk_add_on_ucc_framework import app_manifest as app_manifest_lib
from splunk_add_on_ucc_framework.commands.openapi_generator.oas import (
    OpenAPIObject,
)
from splunk_add_on_ucc_framework.commands.openapi_generator import oas, json_to_object
from splunk_add_on_ucc_framework.commands.openapi_generator.json_to_object import (
    DataClasses,
)


class GloblaConfigPages(Flag):
    CONFIGURATION = auto()
    INPUTS = auto()


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


def __create_schema_name(*, name: str, without: Optional[List[str]] = None) -> str:
    return f"{name}_without_{'_'.join(without)}" if without else name


def __get_schema_object(
    *, name: str, entities: List[Any], without: Optional[List[str]] = None
) -> Tuple[str, oas.SchemaObject]:
    name = __create_schema_name(name=name, without=without)
    schema_object = oas.SchemaObject(type="object", properties={})
    for entity in entities:
        if "helpLink" == entity.type or (
            isinstance(without, list)
            and hasattr(entity, "field")
            and entity.field in without
        ):
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
    return (name, schema_object)


def __add_schemas_object(
    open_api_object: OpenAPIObject, global_config: DataClasses
) -> OpenAPIObject:
    if open_api_object.components is not None:
        open_api_object.components.schemas = {}
        for tab in global_config.pages.configuration.tabs:  # type: ignore[attr-defined]
            schema_name, schema_object = __get_schema_object(
                name=tab.name, entities=tab.entity
            )
            open_api_object.components.schemas[schema_name] = schema_object
            schema_name, schema_object = __get_schema_object(
                name=tab.name, entities=tab.entity, without=["name"]
            )
            open_api_object.components.schemas[schema_name] = schema_object
        if hasattr(global_config.pages, "inputs") and hasattr(  # type: ignore[attr-defined]
            global_config.pages.inputs, "services"  # type: ignore[attr-defined]
        ):
            additional_input_entities = [
                json_to_object.DataClasses(
                    json={
                        "field": "disabled",
                        "type": "singleSelect",
                        "options": {
                            "autoCompleteFields": [
                                {"value": "False"},
                                {"value": "True"},
                            ]
                        },
                    }
                )
            ]
            for service in global_config.pages.inputs.services:  # type: ignore[attr-defined]
                schema_name, schema_object = __get_schema_object(
                    name=service.name,
                    entities=service.entity + additional_input_entities,
                )
                open_api_object.components.schemas[schema_name] = schema_object
                schema_name, schema_object = __get_schema_object(
                    name=service.name,
                    entities=service.entity + additional_input_entities,
                    without=["name"],
                )
                open_api_object.components.schemas[schema_name] = schema_object
                schema_name, schema_object = __get_schema_object(
                    name=service.name,
                    entities=service.entity + additional_input_entities,
                    without=["disabled"],
                )
                open_api_object.components.schemas[schema_name] = schema_object

    return open_api_object


#   consider changing to 'cache' once python is upgraded to >=3.9
@lru_cache(maxsize=None)
def __get_media_type_object_with_schema_ref(
    *, schema_name: str, for_responses: bool = False
) -> oas.MediaTypeObject:
    if for_responses:
        schema_name = __create_schema_name(name=schema_name, without=["name"])
    schema: Optional[Dict[str, Any]] = (
        {"$ref": f"#/components/schemas/{schema_name}"}
        if not for_responses
        else {
            "type": "object",
            "properties": {
                "entry": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "content": {"$ref": f"#/components/schemas/{schema_name}"},
                        },
                    },
                }
            },
        }
    )
    return oas.MediaTypeObject(schema=schema)


def __get_path_get(*, name: str, description: str) -> oas.OperationObject:
    return oas.OperationObject(
        description=description,
        responses={
            "200": oas.ResponseObject(
                description=description,
                content={
                    "application/json": __get_media_type_object_with_schema_ref(
                        schema_name=name, for_responses=True
                    ),
                },
            )
        },
    )


def __get_path_get_for_list(*, name: str) -> oas.OperationObject:
    description = f"Get list of items for {name}"
    return __get_path_get(name=name, description=description)


def __get_path_get_for_item(*, name: str) -> oas.OperationObject:
    description = f"Get {name} item details"
    return __get_path_get(name=name, description=description)


def __get_path_post(
    *, name: str, description: str, request_schema_without: Optional[List[str]] = None
) -> oas.OperationObject:
    return oas.OperationObject(
        description=description,
        requestBody=oas.RequestBodyObject(
            content={
                "application/x-www-form-urlencoded": __get_media_type_object_with_schema_ref(
                    schema_name=__create_schema_name(
                        name=name, without=request_schema_without
                    )
                )
            }
        ),
        responses={
            "200": oas.ResponseObject(
                description=description,
                content={
                    "application/json": __get_media_type_object_with_schema_ref(
                        schema_name=name, for_responses=True
                    ),
                },
            )
        },
    )


def __get_path_post_for_create(
    *, name: str, page: GloblaConfigPages
) -> oas.OperationObject:
    return __get_path_post(
        name=name,
        description=f"Create item in {name}",
        request_schema_without=["disabled"]
        if page == GloblaConfigPages.INPUTS
        else None,
    )


def __get_path_post_for_update(*, name: str) -> oas.OperationObject:
    return __get_path_post(
        name=name, description=f"Update {name} item", request_schema_without=["name"]
    )


def __get_path_delete(*, name: str) -> oas.OperationObject:
    description = f"Delete {name} item"
    return oas.OperationObject(
        description=description,
        responses={
            "200": oas.ResponseObject(
                description=description,
                content={
                    "application/json": __get_media_type_object_with_schema_ref(
                        schema_name=name, for_responses=True
                    ),
                },
            )
        },
    )


def __get_output_mode() -> Dict[str, Any]:
    return {
        "name": "output_mode",
        "in": "query",
        "required": True,
        "description": "Output mode",
        "schema": {"type": "string", "enum": ["json"], "default": "json"},
    }


def __assign_ta_paths(
    *,
    open_api_object: OpenAPIObject,
    path: str,
    path_name: str,
    actions: List[str],
    page: GloblaConfigPages,
) -> OpenAPIObject:
    if open_api_object.paths is not None:
        open_api_object.paths[path] = oas.PathItemObject(
            get=__get_path_get_for_list(name=path_name),
            post=__get_path_post_for_create(name=path_name, page=page),
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
    for tab in global_config.pages.configuration.tabs:  # type: ignore[attr-defined]
        open_api_object = __assign_ta_paths(
            open_api_object=open_api_object,
            path=f"/{global_config.meta.restRoot}_{tab.name}"  # type: ignore[attr-defined]
            if hasattr(tab, "table")
            else f"/{global_config.meta.restRoot}_settings/{tab.name}",  # type: ignore[attr-defined]
            path_name=tab.name,
            actions=tab.table.actions
            if hasattr(tab, "table") and hasattr(tab.table, "actions")
            else None,
            page=GloblaConfigPages.CONFIGURATION,
        )
    if hasattr(global_config.pages, "inputs") and hasattr(  # type: ignore[attr-defined]
        global_config.pages.inputs, "services"  # type: ignore[attr-defined]
    ):
        for service in global_config.pages.inputs.services:  # type: ignore[attr-defined]
            if hasattr(service, "table") and hasattr(service.table, "actions"):
                actions = service.table.actions
            elif hasattr(global_config.pages.inputs, "table") and hasattr(
                global_config.pages.inputs.table, "actions"
            ):
                actions = global_config.pages.inputs.table.actions
            else:
                raise ValueError(
                    f"Can't find table.actions for service name={service.name}"
                )
            open_api_object = __assign_ta_paths(
                open_api_object=open_api_object,
                path=f"/{global_config.meta.restRoot}_{service.name}",  # type: ignore[attr-defined]
                path_name=service.name,
                actions=actions,
                page=GloblaConfigPages.INPUTS,
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
