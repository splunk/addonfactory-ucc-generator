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

from .endpoint.base import indent, quote_regex
from .endpoint.datainput import DataInputEndpointBuilder, DataInputEntityBuilder
from .endpoint.field import RestFieldBuilder
from .endpoint.multiple_model import (
    MultipleModelEndpointBuilder,
    MultipleModelEntityBuilder,
)
from .endpoint.oauth_model import OAuthModelEndpointBuilder
from .endpoint.single_model import SingleModelEndpointBuilder, SingleModelEntityBuilder


def _is_true(val):
    return str(val).strip().upper() in ("1", "TRUE", "T", "Y", "YES")


class GlobalConfigBuilderSchema:
    def __init__(self, content, j2_env):
        self._content = content
        self._inputs = []
        self._configs = []
        self._settings = []
        self.j2_env = j2_env
        self._endpoints = {}
        self._parse()
        self._parse_builder_schema()

    @property
    def product(self):
        return self._meta["name"]

    @property
    def namespace(self):
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
    def endpoints(self):
        return [endpoint for _, endpoint in list(self._endpoints.items())]

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
        # SingleModel
        for config in self._configs:
            self._builder_entity(
                None,
                config["entity"],
                config["name"],
                SingleModelEndpointBuilder,
                SingleModelEntityBuilder,
                conf_name=config.get("conf"),
                rest_handler_name=config.get("restHandlerName"),
            )
            # If we have have given oauth support then we have to add endpoint for accesstoken
            for entity_element in config["entity"]:
                if entity_element["type"] == "oauth":
                    self._get_endpoint(
                        "oauth", OAuthModelEndpointBuilder, app_name=self._meta["name"]
                    )

    def _builder_settings(self):
        # MultipleModel
        for setting in self._settings:
            self._builder_entity(
                setting["name"],
                setting["entity"],
                "settings",
                MultipleModelEndpointBuilder,
                MultipleModelEntityBuilder,
            )

    def _builder_inputs(self):
        # DataInput
        for input_item in self._inputs:
            rest_handler_name = None
            if "restHandlerName" in input_item:
                rest_handler_name = input_item["restHandlerName"]
            if "conf" in input_item:
                self._builder_entity(
                    None,
                    input_item["entity"],
                    input_item["name"],
                    SingleModelEndpointBuilder,
                    SingleModelEntityBuilder,
                    conf_name=input_item["conf"],
                    rest_handler_name=rest_handler_name,
                )
            else:
                self._builder_entity(
                    None,
                    input_item["entity"],
                    input_item["name"],
                    DataInputEndpointBuilder,
                    DataInputEntityBuilder,
                    input_type=input_item["name"],
                    rest_handler_name=rest_handler_name,
                )

    def _builder_entity(
        self, name, content, endpoint, endpoint_builder, entity_builder, *args, **kwargs
    ):
        endpoint_obj = self._get_endpoint(endpoint, endpoint_builder, *args, **kwargs)
        # If the entity contains type oauth then we need to alter the content to generate proper entities to generate
        # the rest handler with the oauth fields
        content = self._get_oauth_enitities(content)
        fields = self._parse_fields(content)
        entity = entity_builder(name, fields, *args, **kwargs)
        endpoint_obj.add_entity(entity)

    def _parse_fields(self, fields_content):
        return [
            self._parse_field(field)
            for field in fields_content
            if field["field"] != "name"
        ]

    def _get_endpoint(self, name, endpoint_builder, *args, **kwargs):
        if name not in self._endpoints:
            endpoint = endpoint_builder(
                name=name,
                namespace=self._meta["restRoot"],
                j2_env=self.j2_env,
                *args,
                **kwargs
            )
            self._endpoints[name] = endpoint
        return self._endpoints[name]

    def _parse_field(self, content):
        return RestFieldBuilder(
            content["field"],
            _is_true(content.get("required")),
            _is_true(content.get("encrypted")),
            content.get("defaultValue"),
            self._parse_validation(content.get("validators")),
        )

    def _parse_validation(self, validation):
        global_config_validation = GlobalConfigValidation(validation)
        return global_config_validation.build()

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


class GlobalConfigValidation:

    _validation_template = """validator.{validator}({arguments})"""

    def __init__(self, validation):
        self._validators = []
        self._validation = validation
        self._validation_mapping = {
            "string": GlobalConfigValidation.string,
            "number": GlobalConfigValidation.number,
            "regex": GlobalConfigValidation.regex,
            "email": GlobalConfigValidation.email,
            "ipv4": GlobalConfigValidation.ipv4,
            "date": GlobalConfigValidation.date,
            "url": GlobalConfigValidation.url,
        }

    def build(self):
        if not self._validation:
            return None
        for item in self._validation:
            parser = self._validation_mapping.get(item["type"], None)
            if parser is None:
                continue
            validator, arguments = parser(item)
            if validator is None:
                continue
            arguments = arguments or {}
            self._validators.append(
                self._validation_template.format(
                    validator=validator,
                    arguments=self._arguments(**arguments),
                )
            )

        if not self._validators:
            return None
        if len(self._validators) > 1:
            return self.multiple_validators(self._validators)
        else:
            return self._validators[0]

    @classmethod
    def _arguments(cls, **kwargs):
        if not kwargs:
            return ""
        args = list(
            map(
                lambda k_v: "{}={}, ".format(k_v[0], k_v[1]),
                list(kwargs.items()),
            )
        )
        args.insert(0, "")
        args.append("")
        return indent("\n".join(args))

    @classmethod
    def _content(cls, validator, arguments):
        pass

    @classmethod
    def string(cls, validation):
        return (
            "String",
            {
                "max_len": validation.get("maxLength"),
                "min_len": validation.get("minLength"),
            },
        )

    @classmethod
    def number(cls, validation):
        ranges = validation.get("range", [None, None])
        return ("Number", {"max_val": ranges[1], "min_val": ranges[0]})

    @classmethod
    def regex(cls, validation):
        return ("Pattern", {"regex": "r" + quote_regex(validation.get("pattern"))})

    @classmethod
    def email(cls, validation):
        regex = (
            r"^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}"
            r"[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
        )
        return ("Pattern", {"regex": "r" + quote_regex(regex)})

    @classmethod
    def ipv4(cls, validation):
        regex = r"^(?:(?:[0-1]?\d{1,2}|2[0-4]\d|25[0-5])(?:\.|$)){4}$"
        return ("Pattern", {"regex": "r" + quote_regex(regex)})

    @classmethod
    def date(cls, validation):
        # iso8601 date time format
        regex = (
            r"^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))"
            r"(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$"
        )
        return ("Pattern", {"regex": "r" + quote_regex(regex)})

    @classmethod
    def url(cls, validation):
        regex = (
            r"^(?:(?:https?|ftp|opc\.tcp):\/\/)?(?:\S+(?::\S*)?@)?"
            r"(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])"
            r"(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}"
            r"(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|"
            r"(?:(?:[a-z\u00a1-\uffff0-9]+-?_?)*[a-z\u00a1-\uffff0-9]+)"
            r"(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*"
            r"(?:\.(?:[a-z\u00a1-\uffff]{2,}))?)(?::\d{2,5})?(?:\/[^\s]*)?$"
        )
        return ("Pattern", {"regex": "r" + quote_regex(regex)})

    @classmethod
    def multiple_validators(cls, validators):
        validators_str = ", \n".join(validators)
        _template = """validator.AllOf(\n{validators}\n)"""
        return _template.format(
            validators=indent(validators_str),
        )


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
        return "{}_import_declare".format(self.schema.namespace)

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
