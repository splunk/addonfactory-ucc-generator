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
import os
import os.path as op
import shutil
from typing import Any, Dict, List, Type

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
    def __init__(self, content, j2_env):
        self._content = content
        self._inputs = []
        self._configs = []
        self._settings = []
        self.j2_env = j2_env
        self._endpoints: Dict[str, RestEndpointBuilder] = {}
        self._parse()
        self._parse_builder_schema()

    @property
    def product(self) -> str:
        return self._meta["name"]

    @property
    def namespace(self) -> str:
        return self._meta["restRoot"]

    @property
    def admin_match(self):
        return ""

    @property
    def inputs(self):
        return self._inputs

    @property
    def configs(self):
        return self._configs

    @property
    def settings(self):
        return self._settings

    @property
    def endpoints(self) -> List[RestEndpointBuilder]:
        return list(self._endpoints.values())

    def _parse(self):
        self._meta = self._content["meta"]
        pages = self._content["pages"]
        self._parse_configuration(pages.get("configuration"))
        self._parse_inputs(pages.get("inputs"))

    def _parse_configuration(self, configurations):
        if not configurations or "tabs" not in configurations:
            return
        for configuration in configurations["tabs"]:
            if "table" in configuration:
                self._configs.append(configuration)
            else:
                self._settings.append(configuration)

    def _parse_inputs(self, inputs):
        if not inputs or "services" not in inputs:
            return
        self._inputs = inputs["services"]

    def _parse_builder_schema(self):
        self._builder_configs()
        self._builder_settings()
        self._builder_inputs()

    def _builder_configs(self):
        for config in self._configs:
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
                    self._get_endpoint(
                        "oauth", OAuthModelEndpointBuilder, app_name=self._meta["name"]
                    )

    def _builder_settings(self):
        for setting in self._settings:
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

    def _builder_inputs(self):
        for input_item in self._inputs:
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
                namespace=self._meta["restRoot"],
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


class GlobalConfigPostProcessor:
    """
    Post process for REST builder.
    """

    output_local = "local"
    _import_declare_template = """
import {import_declare_name}
"""

    _import_declare_content = """
import os
import sys
import re
from os.path import dirname

ta_name = '{ta_name}'
pattern = re.compile(r'[\\\\/]etc[\\\\/]apps[\\\\/][^\\\\/]+[\\\\/]bin[\\\\/]?$')
new_paths = [path for path in sys.path if not pattern.search(path) or ta_name in path]
new_paths.append(os.path.join(dirname(dirname(__file__)), "lib"))
new_paths.insert(0, os.path.sep.join([os.path.dirname(__file__), ta_name]))
sys.path = new_paths
"""

    def __init__(self):
        self.builder = None
        self.schema = None
        self.import_declare_name = None

    @property
    def root_path(self):
        return getattr(self.builder.output, "_path")

    def third_path(self):
        return self.schema.namespace

    def default_to_local(self):
        default_dir = op.join(
            self.root_path,
            self.builder.output.default,
        )
        local_dir = op.join(
            self.root_path,
            self.output_local,
        )
        if not op.isdir(local_dir):
            os.makedirs(local_dir)
        for i in os.listdir(default_dir):
            child = op.join(default_dir, i)
            if op.isdir(child):
                shutil.copytree(child, local_dir)
            else:
                shutil.copy(child, op.join(local_dir, i))

        # remove the default folder
        shutil.rmtree(default_dir, ignore_errors=True)

    def import_declare_py_name(self):
        if self.import_declare_name:
            return self.import_declare_name
        return f"{self.schema.namespace}_import_declare"

    def import_declare_py_content(self):
        import_declare_file = op.join(
            self.root_path,
            self.builder.output.bin,
            self.import_declare_py_name() + ".py",
        )
        content = self._import_declare_content.format(
            ta_name=self.schema.product,
        )
        with open(import_declare_file, "w") as f:
            f.write(content)

    def import_declare(self, rh_file):
        with open(rh_file) as f:
            cont = f.readlines()
        import_declare = self._import_declare_template.format(
            import_declare_name=self.import_declare_py_name()
        )
        cont.insert(0, import_declare)
        with open(rh_file, "w") as f:
            f.write("".join(cont))

    def __call__(self, builder, schema, import_declare_name=None):
        """
        :param builder: REST builder
        :param schema: Global Config Schema
        :return:
        """
        self.builder = builder
        self.schema = schema
        self.import_declare_name = import_declare_name

        self.import_declare_py_content()
        for endpoint in schema.endpoints:
            rh_file = op.join(
                getattr(builder.output, "_path"),
                builder.output.bin,
                endpoint.rh_name + ".py",
            )
            self.import_declare(rh_file)
        # self.default_to_local()

        # add executable permission to files under bin folder
        def add_executable_attribute(file_path):
            if op.isfile(file_path):
                st = os.stat(file_path)
                os.chmod(file_path, st.st_mode | 0o111)

        bin_path = op.join(getattr(builder.output, "_path"), builder.output.bin)
        items = os.listdir(bin_path)
        list(map(add_executable_attribute, items))
