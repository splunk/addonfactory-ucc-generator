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
from typing import Dict, List, Any, Tuple

from splunk_add_on_ucc_framework import global_config as global_config_lib

from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.base import (
    RestEndpointBuilder,
)
from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.datainput import (
    DataInputEndpointBuilder,
    DataInputEntityBuilder,
)
from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.field import (
    RestFieldBuilder,
)
from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.multiple_model import (
    MultipleModelEndpointBuilder,
    MultipleModelEntityBuilder,
)
from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.oauth_model import (
    OAuthModelEndpointBuilder,
)
from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.single_model import (
    SingleModelEndpointBuilder,
    SingleModelEntityBuilder,
    SingleModelEndpointBuilderWithOauth,
)
from splunk_add_on_ucc_framework.commands.rest_builder.validator_builder import (
    ValidatorBuilder,
)

REST_HANDLER_DEFAULT_MODULE = "splunktaucclib.rest_handler.admin_external"
REST_HANDLER_DEFAULT_CLASS = "AdminExternalHandler"


def _is_true(val: Any) -> bool:
    return str(val).strip().upper() in ("1", "TRUE", "T", "Y", "YES")


class GlobalConfigBuilderSchema:
    def __init__(self, global_config: global_config_lib.GlobalConfig):
        self.global_config = global_config
        self._settings_conf_file_names: List[str] = list()
        self._configs_conf_file_names: List[str] = list()
        self._oauth_conf_file_names: List[str] = list()
        self._endpoints: Dict[str, RestEndpointBuilder] = {}
        self._parse_builder_schema()

    @property
    def product(self) -> str:
        return self.global_config.product

    @property
    def namespace(self) -> str:
        return self.global_config.namespace

    @property
    def settings_conf_file_names(self) -> List[str]:
        return self._settings_conf_file_names

    @property
    def configs_conf_file_names(self) -> List[str]:
        return self._configs_conf_file_names

    @property
    def oauth_conf_file_names(self) -> List[str]:
        return self._oauth_conf_file_names

    @property
    def endpoints(self) -> List[RestEndpointBuilder]:
        return list(self._endpoints.values())

    @property
    def need_reload(self) -> bool:
        return False

    def _parse_builder_schema(self) -> None:
        self._builder_configs()
        self._builder_settings()
        self._builder_inputs()

    def _builder_configs(self) -> None:
        oauth_handler = False
        token_endpoint = ""
        auth_condition = True

        for config in self.global_config.configs:
            # If we have given oauth support then we have to add endpoint for access_token
            for entity_element in config["entity"]:
                if entity_element["type"] == "oauth":
                    log_details = self.global_config.logging_tab
                    oauth_endpoint = OAuthModelEndpointBuilder(
                        name="oauth",
                        namespace=self.global_config.namespace,
                        app_name=self.global_config.product,
                        log_stanza=log_details.get("name"),
                        log_level_field=log_details.get("entity", [{}])[0].get("field"),
                    )
                    self._endpoints["oauth"] = oauth_endpoint
                    if oauth_endpoint.conf_name not in self._oauth_conf_file_names:
                        self._oauth_conf_file_names.append(oauth_endpoint.conf_name)

                    auth_types = entity_element["options"]["auth_type"]

                    if "oauth_client_credentials" in auth_types:
                        oauth_handler = True
                        token_endpoint = entity_element["options"][
                            "access_token_endpoint"
                        ]

                        if len(auth_types) == 1:
                            # If we have only the oauth_client_credentials auth type and nothing else
                            # we will not add the auth_type condition
                            auth_condition = False

            name = config["name"]

            endpoint_params = dict(
                name=name,
                namespace=self.global_config.namespace,
                rest_handler_name=config.get("restHandlerName"),
                rest_handler_module=config.get(
                    "restHandlerModule", REST_HANDLER_DEFAULT_MODULE
                ),
                rest_handler_class=config.get(
                    "restHandlerClass", REST_HANDLER_DEFAULT_CLASS
                ),
                need_reload=self.need_reload,
            )

            if oauth_handler:
                endpoint_params["token_endpoint"] = token_endpoint
                endpoint_params["app_name"] = self.global_config.product
                endpoint_params["auth_condition"] = auth_condition
                endpoint: SingleModelEndpointBuilder = (
                    SingleModelEndpointBuilderWithOauth(**endpoint_params)
                )
            else:
                endpoint = SingleModelEndpointBuilder(**endpoint_params)

            self._endpoints[name] = endpoint
            content = self._get_oauth_enitities(config["entity"])
            fields, special_fields = self._parse_fields(content)
            entity = SingleModelEntityBuilder(
                None,
                fields,
                special_fields=special_fields,
                conf_name=config.get("conf"),
            )
            endpoint.add_entity(entity)

            if endpoint.conf_name not in self._configs_conf_file_names:
                self._configs_conf_file_names.append(endpoint.conf_name)

    def _builder_settings(self) -> None:
        if not self.global_config.settings:
            return

        endpoint = MultipleModelEndpointBuilder(
            name="settings",
            namespace=self.global_config.namespace,
            rest_handler_module=REST_HANDLER_DEFAULT_MODULE,
            rest_handler_class=REST_HANDLER_DEFAULT_CLASS,
            need_reload=self.need_reload,
        )
        self._endpoints["settings"] = endpoint
        for setting in self.global_config.settings:
            if setting.get("entity") is not None:
                content = self._get_oauth_enitities(setting["entity"])
                fields, special_fields = self._parse_fields(content)
                entity = MultipleModelEntityBuilder(
                    setting["name"],
                    fields,
                    special_fields=special_fields,
                )
                endpoint.add_entity(entity)
            if endpoint.conf_name not in self._settings_conf_file_names:
                self._settings_conf_file_names.append(endpoint.conf_name)

    def _builder_inputs(self) -> None:
        for input_item in self.global_config.inputs:
            rest_handler_name = input_item.get("restHandlerName")
            rest_handler_module = input_item.get(
                "restHandlerModule",
                REST_HANDLER_DEFAULT_MODULE,
            )
            rest_handler_class = input_item.get(
                "restHandlerClass",
                REST_HANDLER_DEFAULT_CLASS,
            )
            if "conf" in input_item:
                name = input_item["name"]
                single_model_endpoint = SingleModelEndpointBuilder(
                    name=name,
                    namespace=self.global_config.namespace,
                    rest_handler_name=rest_handler_name,
                    rest_handler_module=rest_handler_module,
                    rest_handler_class=rest_handler_class,
                    need_reload=self.need_reload,
                )
                self._endpoints[name] = single_model_endpoint
                content = self._get_oauth_enitities(input_item["entity"])
                fields, special_fields = self._parse_fields(content)
                single_model_entity = SingleModelEntityBuilder(
                    None,
                    fields,
                    special_fields=special_fields,
                    conf_name=input_item["conf"],
                )
                single_model_endpoint.add_entity(single_model_entity)
            else:
                name = input_item["name"]
                data_input_endpoint = DataInputEndpointBuilder(
                    name=name,
                    namespace=self.global_config.namespace,
                    input_type=input_item["name"],
                    rest_handler_name=rest_handler_name,
                    rest_handler_module=rest_handler_module,
                    rest_handler_class=rest_handler_class,
                )
                self._endpoints[name] = data_input_endpoint
                content = self._get_oauth_enitities(input_item["entity"])
                fields, special_fields = self._parse_fields(content)
                data_input_entity = DataInputEntityBuilder(
                    None,
                    fields,
                    special_fields=special_fields,
                    input_type=input_item["name"],
                )
                data_input_endpoint.add_entity(data_input_entity)

    def _parse_fields(
        self, fields_content: List[Dict[str, Any]]
    ) -> Tuple[List[RestFieldBuilder], List[RestFieldBuilder]]:
        fields: List[RestFieldBuilder] = []
        special_fields: List[RestFieldBuilder] = []
        if fields_content:
            for field in fields_content:
                rest_field = RestFieldBuilder(
                    field["field"],
                    _is_true(field.get("required")),
                    _is_true(field.get("encrypted")),
                    field.get("defaultValue"),
                    ValidatorBuilder().build(field.get("validators")),
                )

                if field["field"] != "name":
                    fields.append(rest_field)
                else:
                    special_fields.append(rest_field)
        return fields, special_fields

    """
    If the entity contains type oauth then we need to alter the content to generate proper entities to generate
    the rest handler with the oauth fields
    :param content: json content of entity
    :type content: `json`
    """

    def _get_oauth_enitities(
        self, content: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        if content:
            for entity_element in content:
                # Check if we have oauth type
                if entity_element["type"] != "oauth":
                    continue

                auth_types = entity_element["options"]["auth_type"]

                if "basic" in auth_types:
                    # Append all the basic auth fields to the content
                    content = content + entity_element["options"]["basic"]

                if "oauth" in auth_types:
                    # Append all the oauth auth fields to the content
                    content = content + entity_element["options"]["oauth"]

                if "oauth_client_credentials" in auth_types:
                    # Append all the oauth client credentials auth fields to the content
                    content = (
                        content + entity_element["options"]["oauth_client_credentials"]
                    )

                if "oauth" in auth_types or "oauth_client_credentials" in auth_types:
                    # Append OAuth fields if there is at least one auth type
                    content = content + [
                        {"field": "access_token", "encrypted": True},
                        {"field": "refresh_token", "encrypted": True},
                        {"field": "instance_url"},
                    ]

                if len(auth_types) > 1:
                    # Append auth_type field if there are multiple auth types
                    content = content + [{"field": "auth_type"}]

                # We will remove the oauth type entity as we have replaced it with all the entity fields
                content.remove(entity_element)
                break

        return content
