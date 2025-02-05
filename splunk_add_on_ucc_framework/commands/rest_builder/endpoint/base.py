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
from io import StringIO

__all__ = [
    "RestEntityBuilder",
    "RestEndpointBuilder",
    "quote_string",
    "indent",
]

from typing import Optional, List, TYPE_CHECKING, Any

if TYPE_CHECKING:
    from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.field import (
        RestFieldBuilder,
    )


class RestEntityBuilder:
    _title_template = "[{}]"
    _rh_template = """
fields{name_rh} = [
{fields}
]
model{name_rh} = RestModel(fields{name_rh}, name={name}{special_fields_arg})
"""
    _disabled_field_template = """
field.RestField(
    'disabled',
    required=False,
    validator=None
)
"""
    _rh_special_fields_template = """
special_fields = [
{special_fields}
]
"""

    def __init__(
        self,
        name: Optional[str],
        fields: List["RestFieldBuilder"],
        special_fields: Optional[List["RestFieldBuilder"]] = None,
        **kwargs: Any,
    ) -> None:
        self._name = name
        self._fields = fields
        self._special_fields = special_fields if special_fields else []
        self._special_fields_arg = (
            ", special_fields=special_fields" if special_fields else ""
        )
        self._conf_name = kwargs.get("conf_name")

    @property
    def name(self) -> Optional[str]:
        return self._name

    @property
    def name_spec(self) -> Optional[str]:
        raise NotImplementedError()

    @property
    def name_rh(self) -> str:
        raise NotImplementedError()

    def generate_spec(self) -> str:
        title = self._title_template.format(self.name_spec)
        lines = [field.generate_spec() for field in self._fields]
        lines.insert(0, title)
        return "\n".join(lines)

    def generate_conf_with_default_values(self) -> str:
        title = self._title_template.format(self.name_spec)
        lines = [field.generate_conf_with_default_value() for field in self._fields]
        lines.insert(0, title)
        return "\n".join(lines)

    def generate_rh(self) -> str:
        fields = [field.generate_rh() for field in self._fields]
        special_fields = [
            special_field.generate_rh() for special_field in self._special_fields
        ]
        # add disabled field for data input
        entity_builder = self.__class__.__name__
        if (
            entity_builder == "DataInputEntityBuilder"
            or entity_builder == "SingleModelEntityBuilder"
            and self._conf_name
        ):
            fields.append(self._disabled_field_template)
        fields_lines = ", \n".join(fields)
        if special_fields:
            special_fields_lines = ", \n".join(special_fields)
            template = self._rh_special_fields_template + self._rh_template
            return template.format(
                special_fields=indent(special_fields_lines),
                fields=indent(fields_lines),
                name_rh=self.name_rh,
                name=quote_string(self._name),
                special_fields_arg=self._special_fields_arg,
            )
        return self._rh_template.format(
            fields=indent(fields_lines),
            name_rh=self.name_rh,
            name=quote_string(self._name),
            special_fields_arg=self._special_fields_arg,
        )


class RestEndpointBuilder:
    def __init__(self, name: Optional[str], namespace: str, **kwargs: Any):
        self._name = name
        self._namespace = namespace
        self._entities: List[RestEntityBuilder] = []
        conf_name = kwargs.get("conf_name")
        if conf_name is not None:
            self._conf_name = conf_name
        else:
            if self._name is None:
                raise ValueError(
                    "conf_name needs to be provided or name should not be None"
                )
            else:
                self._conf_name = self.name.lower()
        rest_handler_name = kwargs.get("rest_handler_name")
        if rest_handler_name is not None:
            self._rest_handler_name = rest_handler_name
        else:
            self._rest_handler_name = f"{self._namespace}_rh_{self._name}"
        self._rest_handler_module = kwargs.get("rest_handler_module")
        self._rest_handler_class = kwargs.get("rest_handler_class")
        self._need_reload = kwargs.get("need_reload", False)

    @property
    def name(self) -> str:
        return f"{self._namespace}_{self._name}"

    @property
    def namespace(self) -> str:
        return self._namespace

    @property
    def conf_name(self) -> str:
        return self._conf_name

    @property
    def rh_name(self) -> str:
        return self._rest_handler_name

    @property
    def rh_module(self) -> Optional[str]:
        return self._rest_handler_module

    @property
    def rh_class(self) -> Optional[str]:
        return self._rest_handler_class

    @property
    def entities(self) -> List[RestEntityBuilder]:
        return self._entities

    @property
    def need_reload(self) -> bool:
        return self._need_reload

    def add_entity(self, entity: RestEntityBuilder) -> None:
        self._entities.append(entity)

    def actions(self) -> List[str]:
        raise NotImplementedError()

    def generate_spec(self) -> str:
        specs = [entity.generate_spec() for entity in self._entities]
        return "\n\n".join(specs)

    def generate_conf_with_default_values(self) -> str:
        specs = [
            entity.generate_conf_with_default_values() for entity in self._entities
        ]
        return "\n\n".join(specs)

    def generate_rh(self) -> str:
        raise NotImplementedError()


def quote_string(value: Optional[str]) -> Optional[str]:
    """
    Quote a string
    :param value:
    :return:
    """

    if isinstance(value, str):
        return "'%s'" % value
    else:
        return value


def indent(lines: Optional[str], spaces: int = 1) -> str:
    """
    Indent code block.

    :param lines:
    :type lines: str
    :param spaces: times of four
    :return:
    """
    string_io = StringIO(str(lines))
    indentation = spaces * 4
    prefix = " " * indentation
    result_lines = []
    for line in string_io:
        if line != "\n":
            line = prefix + line
        result_lines.append(line)
    return "".join(result_lines)
