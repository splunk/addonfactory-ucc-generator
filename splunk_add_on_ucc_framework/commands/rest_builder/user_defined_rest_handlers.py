from dataclasses import dataclass
from typing import Dict, Any, Union, Iterable, Optional, Set, List, Literal

from splunk_add_on_ucc_framework.commands.openapi_generator import oas

HandlerType = Literal["EAI"]

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
class RestHandlerConfig:
    name: str
    endpoint: str
    handlerType: HandlerType
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

    def _oas_object_eai_list(self, description: str) -> Optional[oas.OperationObject]:
        if "list" not in self.supported_actions:
            return None

        op_obj: Dict[str, Any] = {
            "description": description,
            "responses": {
                "200": oas.ResponseObject(description=description),
            },
        }

        if self.request_parameters.get("list"):
            op_obj["parameters"] = [
                {
                    "name": key,
                    "in": "query",
                    "required": item.get("required", False),
                    "schema": item["schema"],
                }
                for key, item in self.request_parameters["list"].items()
            ]

        if self.response_parameters.get("list"):
            op_obj["responses"]["200"].content = {
                "application/json": _eai_response_schema(
                    self._eai_params_to_schema_object(self.response_parameters["list"])
                )
            }

        return oas.OperationObject(**op_obj)

    def _oas_object_eai_list_all(self) -> Optional[oas.OperationObject]:
        return self._oas_object_eai_list(f"Get list of items for {self.name}")

    def _oas_object_eai_list_one(self) -> Optional[oas.OperationObject]:
        return self._oas_object_eai_list(f"Get {self.name} item details")

    def _oas_object_eai_create(self) -> Optional[oas.OperationObject]:
        if "create" not in self.supported_actions:
            return None

        description = f"Create item in {self.name}"

        op_obj: Dict[str, Any] = {
            "description": description,
            "responses": {
                "200": oas.ResponseObject(description=description),
            },
        }

        if self.request_parameters.get("create"):
            op_obj["requestBody"] = oas.RequestBodyObject(
                content={
                    "application/x-www-form-urlencoded": {
                        "schema": self._eai_params_to_schema_object(
                            self.request_parameters["create"]
                        ),
                    },
                }
            )

        if self.response_parameters.get("create"):
            op_obj["responses"]["200"].content = {
                "application/json": _eai_response_schema(
                    self._eai_params_to_schema_object(
                        self.response_parameters["create"]
                    )
                )
            }

        return oas.OperationObject(**op_obj)

    def _oas_object_eai_edit(self) -> Optional[oas.OperationObject]:
        if "edit" not in self.request_parameters:
            return None

        description = f"Update {self.name} item"
        op_obj: Dict[str, Any] = {
            "description": description,
            "responses": {
                "200": oas.ResponseObject(description=description),
            },
        }

        if self.request_parameters.get("edit"):
            op_obj["requestBody"] = oas.RequestBodyObject(
                content={
                    "application/x-www-form-urlencoded": {
                        "schema": self._eai_params_to_schema_object(
                            self.request_parameters.get("edit")
                        ),
                    },
                }
            )

        if self.response_parameters.get("edit"):
            op_obj["responses"]["200"].content = {
                "application/json": _eai_response_schema(
                    self._eai_params_to_schema_object(
                        self.response_parameters.get("edit")
                    )
                )
            }

        return oas.OperationObject(**op_obj)

    def _oas_object_eai_remove(self) -> Optional[oas.OperationObject]:
        if "remove" not in self.request_parameters:
            return None

        description = f"Delete {self.name} item"

        op_obj: Dict[str, Any] = {
            "description": description,
            "responses": {
                "200": oas.ResponseObject(description=description),
            },
        }

        if self.request_parameters.get("remove"):
            op_obj["parameters"] = [
                {
                    "name": key,
                    "in": "query",
                    "required": item.get("required", False),
                    "schema": item["schema"],
                }
                for key, item in self.request_parameters["remove"].items()
            ]

        if self.response_parameters.get("remove"):
            op_obj["responses"]["200"].content = {
                "application/json": _eai_response_schema(
                    self._eai_params_to_schema_object(
                        self.response_parameters["remove"]
                    )
                )
            }

        return oas.OperationObject(**op_obj)

    def _oas_objects_eai(self) -> Dict[str, oas.PathItemObject]:
        endpoint = self.endpoint.strip("/")

        obj: Dict[str, Any] = {}
        list_all = self._oas_object_eai_list_all()

        if list_all:
            obj["get"] = list_all

        create = self._oas_object_eai_create()

        if create:
            obj["post"] = create

        obj_dict: Dict[str, Any] = {}

        if obj:
            obj["parameters"] = EAI_DEFAULT_PARAMETERS
            obj_dict[f"/{endpoint}"] = oas.PathItemObject(**obj)

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
            obj_dict[f"/{endpoint}/{{name}}"] = oas.PathItemObject(**obj_specified)

        return obj_dict

    @property
    def oas_paths(self) -> Dict[str, oas.PathItemObject]:
        return self._oas_objects_eai()


class UserDefinedRestHandlers:
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
            raise ValueError(f"Duplicate REST handler name: {definition.name}")

        if definition.endpoint in self._endpoints:
            raise ValueError(f"Duplicate REST handler endpoint: {definition.endpoint}")

        self._names.add(definition.name)
        self._endpoints.add(definition.endpoint)

        self._definitions.append(definition)

    @property
    def oas_paths(self) -> Dict[str, oas.PathItemObject]:
        paths = {}

        for definition in self._definitions:
            paths.update(definition.oas_paths)

        return paths
