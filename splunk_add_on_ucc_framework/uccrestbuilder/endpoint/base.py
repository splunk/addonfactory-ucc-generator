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
from future import standard_library
from splunktaucclib.rest_handler.schema import RestSchema

standard_library.install_aliases()

__all__ = [
    "RestEntityBuilder",
    "RestEndpointBuilder",
    "quote_string",
    "indent",
]


class RestEntityBuilder:

    _title_template = "[{}]"
    _rh_template = """
fields{name_rh} = [
{fields}
]
model{name_rh} = RestModel(fields{name_rh}, name={name})
"""
    _disabled_feild_template = """
field.RestField(
    'disabled',
    required=False,
    validator=None
)
"""

    def __init__(self, name, fields, **kwargs):
        self._name = name
        self._fields = fields
        self._conf_name = kwargs.get("conf_name")

    @property
    def name(self):
        return self._name

    @property
    def name_spec(self):
        raise NotImplementedError()

    @property
    def name_default(self):
        raise NotImplementedError()

    @property
    def name_rh(self):
        raise NotImplementedError()

    def generate_spec(self, omit_kv_pairs=False):
        title = self._title_template.format(self.name_spec)
        if omit_kv_pairs:
            return title
        lines = [field.generate_spec() for field in self._fields]
        lines.insert(0, title)
        return "\n".join(lines)

    def generate_rh(self):
        fields = []
        for field in self._fields:
            field_line = field.generate_rh()
            fields.append(field_line)
        # add disabled field for data input
        entity_builder = self.__class__.__name__
        if (
            entity_builder == "DataInputEntityBuilder"
            or entity_builder == "SingleModelEntityBuilder"
            and self._conf_name
        ):
            fields.append(self._disabled_feild_template)
        fields_lines = ", \n".join(fields)
        return self._rh_template.format(
            fields=indent(fields_lines),
            name_rh=self.name_rh,
            name=quote_string(self._name),
        )


class RestEndpointBuilder:
    def __init__(self, name, namespace, **kwargs):
        self._name = name
        self._namespace = namespace
        self._entities = []
        self._conf_name = (
            kwargs.get("conf_name")
            if kwargs.get("conf_name") is not None
            else self.name.lower()
        )
        if kwargs.get("rest_handler_name") is not None:
            self._rest_handler_name = kwargs.get("rest_handler_name")
        else:
            self._rest_handler_name = "{}_rh_{}".format(self._namespace, self._name)

    @property
    def name(self):
        return RestSchema.endpoint_name(self._name, self._namespace)

    @property
    def namespace(self):
        return self._namespace

    @property
    def conf_name(self):
        return self._conf_name

    @property
    def rh_name(self):
        return self._rest_handler_name

    @property
    def entities(self):
        return self._entities

    def add_entity(self, entity):
        self._entities.append(entity)

    def actions(self):
        raise NotImplementedError()

    def generate_spec(self):
        specs = [entity.generate_spec() for entity in self._entities]
        return "\n\n".join(specs)

    def generate_default_conf(self):
        specs = [entity.generate_spec(True) for entity in self._entities]
        return "\n\n".join(specs)

    def generate_rh(self, handler):
        raise NotImplementedError()


def quote_string(value):
    """
    Quote a string
    :param value:
    :return:
    """
    if isinstance(value, str):
        return "'%s'" % value
    else:
        return value


def quote_regex(value):
    """
    Quote a regex
    :param value:
    :return:
    """
    if isinstance(value, str):
        return '"""%s"""' % value
    else:
        return value


def indent(lines, spaces=1):
    """
    Indent code block.

    :param lines:
    :type lines: str
    :param spaces: times of four
    :return:
    """
    if lines is None:
        return ""
    indentation = spaces * 4
    prefix = " " * indentation
    intended_lines = []
    for line in lines:
        if line != "\n":
            line = prefix + line
        intended_lines.append(line)
    return "".join(intended_lines)
