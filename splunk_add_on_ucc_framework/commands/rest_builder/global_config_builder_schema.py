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

"""
Global config schema.
"""


import json
from typing import Any, Dict, List, Type, Set

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
)
from splunk_add_on_ucc_framework.commands.rest_builder.validator_builder import (
    ValidatorBuilder,
)

REST_HANDLER_DEFAULT_MODULE = "splunktaucclib.rest_handler.admin_external"
REST_HANDLER_DEFAULT_CLASS = "AdminExternalHandler"


def _is_true(val):
    return str(val).strip().upper() in ("1", "TRUE", "T", "Y", "YES")


class GlobalConfigBuilderSchema:
    def __init__(self, global_config: global_config_lib.GlobalConfig, j2_env):
        self.global_config = global_config
        self.j2_env = j2_env
        self._settings_conf_file_names: Set[str] = set()
        self._configs_conf_file_names: Set[str] = set()
        self._oauth_conf_file_names: Set[str] = set()
        self._endpoints: Dict[str, RestEndpointBuilder] = {}
        self._parse_builder_schema()

    @property
    def product(self) -> str:
        return self.global_config.product

    @property
    def namespace(self) -> str:
        return self.global_config.namespace

    @property
    def settings_conf_file_names(self):
        return self._settings_conf_file_names

    @property
    def configs_conf_file_names(self):
        return self._configs_conf_file_names

    @property
    def oauth_conf_file_names(self):
        return self._oauth_conf_file_names

    @property
    def endpoints(self) -> List[RestEndpointBuilder]:
        return list(self._endpoints.values())

    def _parse_builder_schema(self):
        self._builder_configs()
        self._builder_settings()
        self._builder_inputs()

    def _builder_configs(self):
        for config in self.global_config.configs:
            endpoint_obj = self._get_endpoint(
                config["name"],
                SingleModelEndpointBuilder,
                rest_handler_name=config.get("restHandlerName"),
                rest_handler_module=REST_HANDLER_DEFAULT_MODULE,
                rest_handler_class=REST_HANDLER_DEFAULT_CLASS,
            )
            content = self._get_oauth_enitities(config["entity"])
            fields = self._parse_fields(content)
            entity = SingleModelEntityBuilder(
                None,
                fields,
                conf_name=config.get("conf"),
            )
            endpoint_obj.add_entity(entity)
            # If we have given oauth support then we have to add endpoint for accesstoken
            for entity_element in config["entity"]:
                if entity_element["type"] == "oauth":
                    oauth_endpoint = self._get_endpoint(
                        "oauth",
                        OAuthModelEndpointBuilder,
                        app_name=self.global_config.product,
                    )
                    self._oauth_conf_file_names.add(oauth_endpoint.conf_name)
            self._configs_conf_file_names.add(endpoint_obj.conf_name)

    def _builder_settings(self):
        for setting in self.global_config.settings:
            endpoint_obj = self._get_endpoint(
                "settings",
                MultipleModelEndpointBuilder,
                rest_handler_module=REST_HANDLER_DEFAULT_MODULE,
                rest_handler_class=REST_HANDLER_DEFAULT_CLASS,
            )
            content = self._get_oauth_enitities(setting["entity"])
            fields = self._parse_fields(content)
            entity = MultipleModelEntityBuilder(
                setting["name"],
                fields,
            )
            endpoint_obj.add_entity(entity)
            self._settings_conf_file_names.add(endpoint_obj.conf_name)

    def _builder_inputs(self):
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
                endpoint_obj = self._get_endpoint(
                    input_item["name"],
                    SingleModelEndpointBuilder,
                    rest_handler_name=rest_handler_name,
                    rest_handler_module=rest_handler_module,
                    rest_handler_class=rest_handler_class,
                )
                content = self._get_oauth_enitities(input_item["entity"])
                fields = self._parse_fields(content)
                entity = SingleModelEntityBuilder(
                    None,
                    fields,
                    conf_name=input_item["conf"],
                )
                endpoint_obj.add_entity(entity)
            else:
                endpoint_obj = self._get_endpoint(
                    input_item["name"],
                    DataInputEndpointBuilder,
                    input_type=input_item["name"],
                    rest_handler_name=rest_handler_name,
                    rest_handler_module=rest_handler_module,
                    rest_handler_class=rest_handler_class,
                )
                content = self._get_oauth_enitities(input_item["entity"])
                fields = self._parse_fields(content)
                entity = DataInputEntityBuilder(
                    None,
                    fields,
                    input_type=input_item["name"],
                )
                endpoint_obj.add_entity(entity)

    def _parse_fields(self, fields_content):
        return [
            self._parse_field(field)
            for field in fields_content
            if field["field"] != "name"
        ]

    def _get_endpoint(
        self, name: str, endpoint_builder: Type[RestEndpointBuilder], **kwargs: Any
    ):
        if name not in self._endpoints:
            endpoint = endpoint_builder(
                name=name,
                namespace=self.global_config.namespace,
                j2_env=self.j2_env,
                **kwargs,
            )
            self._endpoints[name] = endpoint
        return self._endpoints[name]

    def _parse_field(self, content) -> RestFieldBuilder:
        return RestFieldBuilder(
            content["field"],
            _is_true(content.get("required")),
            _is_true(content.get("encrypted")),
            content.get("defaultValue"),
            ValidatorBuilder().build(content.get("validators")),
        )

    """
    If the entity contains type oauth then we need to alter the content to generate proper entities to generate
    the rest handler with the oauth fields
    :param content: json content of entity
    :type content: `json`
    """

    def _get_oauth_enitities(self, content):
        for entity_element in content:
            # Check if we have oauth type
            if entity_element["type"] == "oauth":
                # Check if we have both basic and oauth type authentication is required
                if (
                    "basic" in entity_element["options"]["auth_type"]
                    and "oauth" in entity_element["options"]["auth_type"]
                ):
                    # Append all the basic auth fields to the content
                    content = content + entity_element["options"]["basic"]
                    # Append oauth auth fields to the content
                    content = content + entity_element["options"]["oauth"]
                    # Append auth_type, access_token, refresh_token & instance_url fields
                    content = content + json.loads(
                        '[{"field": "access_token","encrypted": true},'
                        '{"field": "refresh_token","encrypted":true},'
                        '{"field": "instance_url"},'
                        '{"field": "auth_type"}]'
                    )
                # If only oauth type authentication is required
                elif "oauth" in entity_element["options"]["auth_type"]:
                    # Append all the oauth auth fields to the content
                    content = content + entity_element["options"]["oauth"]
                    # Append access_token, refresh_token & instance_url fields
                    content = content + json.loads(
                        '[{"field": "access_token","encrypted": true},'
                        '{"field": "refresh_token","encrypted":true},'
                        '{"field": "instance_url"}]'
                    )
                # We will remove the oauth type entity as we have replaced it with all the entity fields
                content.remove(entity_element)
                break
        return content
