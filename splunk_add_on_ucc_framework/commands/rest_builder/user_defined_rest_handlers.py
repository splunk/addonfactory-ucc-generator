#
# Copyright 2025 Splunk Inc.
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
from copy import deepcopy
from dataclasses import dataclass
from typing import Dict, Any, Union, Iterable, Optional, Set, List

from splunk_add_on_ucc_framework.commands.openapi_generator import oas


_EAI_OUTPUT_MODE = {
    "name": "output_mode",
    "in": "query",
    "required": True,
    "description": "Output mode",
    "schema": {
        "type": "string",
        "enum": ["json"],
        "default": "json",
    },
}
EAI_DEFAULT_PARAMETERS = [_EAI_OUTPUT_MODE]
EAI_DEFAULT_PARAMETERS_SPECIFIED = [
    _EAI_OUTPUT_MODE,
    {
        "name": "name",
        "in": "path",
        "required": True,
        "description": "The name of the item to operate on",
        "schema": {"type": "string"},
    },
]


def _eai_response_schema(schema: Any) -> oas.MediaTypeObject:
    return oas.MediaTypeObject(
        schema={
            "type": "object",
            "properties": {
                "entry": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "content": schema,
                        },
                    },
                }
            },
        }
    )


@dataclass
class EndpointRegistrationEntry:
    """
    Represents an entry in the endpoint registration file.
    """

    name: str
    rh_name: str
    actions_list: List[str]

    def actions(self) -> List[str]:
        """
        Method for consistency with RestEndpointBuilder.
        """
        return self.actions_list


@dataclass
class RestHandlerConfig:
    """
    Represents a REST handler configuration. See schema.json.
    """

    name: str
    endpoint: str
    handlerType: str
    registerHandler: Optional[Dict[str, Any]] = None
    requestParameters: Optional[Dict[str, Dict[str, Any]]] = None
    responseParameters: Optional[Dict[str, Dict[str, Any]]] = None

    @property
    def request_parameters(self) -> Dict[str, Dict[str, Any]]:
        return self.requestParameters or {}

    @property
    def response_parameters(self) -> Dict[str, Dict[str, Any]]:
        return self.responseParameters or {}

    @property
    def supported_actions(self) -> Set[str]:
        actions = set((self.registerHandler or {}).get("actions", []))
        actions.update(self.request_parameters.keys())
        actions.update(self.response_parameters.keys())
        return actions

    def _eai_params_to_schema_object(
        self, params: Optional[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        if not params:
            return None

        obj: Dict[str, Any] = {
            "type": "object",
            "properties": {},
        }

        required = []

        for name, param in params.items():
            obj["properties"][name] = param["schema"]

            if param.get("required", False):
                required.append(name)

        if required:
            obj["required"] = required

        return obj

    def _oas_object_eai_list_or_remove(
        self, description: str, action: str
    ) -> Optional[oas.OperationObject]:
        if action not in self.supported_actions:
            return None

        op_obj: Dict[str, Any] = {
            "description": description,
            "responses": {
                "200": oas.ResponseObject(description=description),
            },
        }

        if self.request_parameters.get(action):
            op_obj["parameters"] = [
                {
                    "name": key,
                    "in": "query",
                    "required": item.get("required", False),
                    "schema": item["schema"],
                }
                for key, item in self.request_parameters[action].items()
            ]

        if self.response_parameters.get(action):
            op_obj["responses"]["200"].content = {
                "application/json": _eai_response_schema(
                    self._eai_params_to_schema_object(self.response_parameters[action])
                )
            }

        return oas.OperationObject(**op_obj)

    def _oas_object_eai_create_or_edit(
        self, description: str, action: str
    ) -> Optional[oas.OperationObject]:
        if action not in self.supported_actions:
            return None

        request_parameters = deepcopy(self.request_parameters.get(action, {}))

        if action == "create":
            request_parameters["name"] = {
                "schema": {"type": "string"},
                "required": True,
            }

        op_obj: Dict[str, Any] = {
            "description": description,
            "responses": {
                "200": oas.ResponseObject(description=description),
            },
        }

        if request_parameters:
            op_obj["requestBody"] = oas.RequestBodyObject(
                content={
                    "application/x-www-form-urlencoded": {
                        "schema": self._eai_params_to_schema_object(request_parameters),
                    },
                }
            )

        if self.response_parameters.get(action):
            op_obj["responses"]["200"].content = {
                "application/json": _eai_response_schema(
                    self._eai_params_to_schema_object(self.response_parameters[action])
                )
            }

        return oas.OperationObject(**op_obj)

    def _oas_object_eai_list_all(self) -> Optional[oas.OperationObject]:
        return self._oas_object_eai_list_or_remove(
            f"Get list of items for {self.name}", "list"
        )

    def _oas_object_eai_list_one(self) -> Optional[oas.OperationObject]:
        return self._oas_object_eai_list_or_remove(
            f"Get {self.name} item details", "list"
        )

    def _oas_object_eai_create(self) -> Optional[oas.OperationObject]:
        return self._oas_object_eai_create_or_edit(
            f"Create item in {self.name}", "create"
        )

    def _oas_object_eai_edit(self) -> Optional[oas.OperationObject]:
        return self._oas_object_eai_create_or_edit(f"Update {self.name} item", "edit")

    def _oas_object_eai_remove(self) -> Optional[oas.OperationObject]:
        return self._oas_object_eai_list_or_remove(f"Delete {self.name} item", "remove")

    def _oas_objects_eai_normal(self) -> Dict[str, oas.PathItemObject]:
        endpoint = self.endpoint.strip("/")

        obj: Dict[str, Any] = {}
        list_all = self._oas_object_eai_list_all()

        if list_all:
            obj["get"] = list_all

        create = self._oas_object_eai_create()

        if create:
            obj["post"] = create

        if obj:
            obj["parameters"] = EAI_DEFAULT_PARAMETERS
            return {f"/{endpoint}": oas.PathItemObject(**obj)}

        return {}

    def _oas_objects_eai_specified(self) -> Dict[str, oas.PathItemObject]:
        endpoint = self.endpoint.strip("/")

        obj_specified: Dict[str, Any] = {}

        list_one = self._oas_object_eai_list_one()

        if list_one:
            obj_specified["get"] = list_one

        edit = self._oas_object_eai_edit()

        if edit:
            obj_specified["post"] = edit

        remove = self._oas_object_eai_remove()

        if remove:
            obj_specified["delete"] = remove

        if obj_specified:
            obj_specified["parameters"] = EAI_DEFAULT_PARAMETERS_SPECIFIED
            return {f"/{endpoint}/{{name}}": oas.PathItemObject(**obj_specified)}

        return {}

    def _oas_objects_eai(self) -> Dict[str, oas.PathItemObject]:
        obj_dict: Dict[str, oas.PathItemObject] = {}

        obj_dict.update(self._oas_objects_eai_normal())
        obj_dict.update(self._oas_objects_eai_specified())

        return obj_dict

    @property
    def oas_paths(self) -> Dict[str, oas.PathItemObject]:
        if self.handlerType == "EAI":
            return self._oas_objects_eai()
        else:
            raise ValueError(f"Unsupported handler type: {self.handlerType}")

    @property
    def endpoint_registration_entry(self) -> Optional[EndpointRegistrationEntry]:
        if not self.registerHandler:
            return None

        if not self.registerHandler.get("actions") or not self.registerHandler.get(
            "file"
        ):
            return None

        file: str = self.registerHandler["file"]

        if file.endswith(".py"):
            file = file[:-3]

        return EndpointRegistrationEntry(
            name=self.endpoint,
            rh_name=file,
            actions_list=self.registerHandler["actions"],
        )


class UserDefinedRestHandlers:
    """
    Represents a logic for dealing with user-defined REST handlers
    """

    def __init__(self) -> None:
        self._definitions: List[RestHandlerConfig] = []
        self._names: Set[str] = set()
        self._endpoints: Set[str] = set()

    def add_definitions(
        self, definitions: Iterable[Union[Dict[str, Any], RestHandlerConfig]]
    ) -> None:
        for definition in definitions:
            self.add_definition(definition)

    def add_definition(
        self, definition: Union[Dict[str, Any], RestHandlerConfig]
    ) -> None:
        if not isinstance(definition, RestHandlerConfig):
            definition = RestHandlerConfig(**definition)

        if definition.name in self._names:
            raise ValueError(
                f"REST handler defined in Global Config contains duplicated name: {definition.name}. "
                "Please change it to a unique name."
            )

        if definition.endpoint in self._endpoints:
            raise ValueError(
                f"REST handler defined in Global Config contains duplicated endpoint: {definition.endpoint} "
                f"(name={definition.name}). Please change it to a unique endpoint."
            )

        self._names.add(definition.name)
        self._endpoints.add(definition.endpoint)

        self._definitions.append(definition)

    @property
    def oas_paths(self) -> Dict[str, oas.PathItemObject]:
        paths = {}

        for definition in self._definitions:
            paths.update(definition.oas_paths)

        return paths

    @property
    def endpoint_registration_entries(self) -> List[EndpointRegistrationEntry]:
        entries = []

        for definition in self._definitions:
            entry = definition.endpoint_registration_entry

            if entry is None:
                continue

            entries.append(entry)

        return entries
