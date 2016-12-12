"""
Global config schema.
"""

from __future__ import absolute_import

import os
import os.path as op
import shutil
from solnlib.utils import is_true
from splunktaucclib.global_config import GlobalConfigSchema
from splunktaucclib.rest_handler.endpoint.field import RestField

from .endpoint.field import RestFieldBuilder
from .endpoint.single_model import (
    SingleModelEntityBuilder,
    SingleModelEndpointBuilder,
)
from .endpoint.multiple_model import (
    MultipleModelEntityBuilder,
    MultipleModelEndpointBuilder,
)
from .endpoint.datainput import (
    DataInputEndpointBuilder,
    DataInputEntityBuilder,
)
from .endpoint.base import indent, quote_regex


class GlobalConfigBuilderSchema(GlobalConfigSchema):

    def __init__(self, content, *args, **kwargs):
        super(GlobalConfigBuilderSchema, self).__init__(
            content,
            *args,
            **kwargs
        )
        self._endpoints = {}
        self._parse_builder_schema()

    @property
    def endpoints(self):
        return [endpoint for _, endpoint in self._endpoints.iteritems()]

    def _parse_builder_schema(self):
        self._builder_configs()
        self._builder_settings()
        self._builder_inputs()

    def _builder_configs(self):
        # SingleModel
        for config in self._configs:
            self._builder_entity(
                None,
                config['entity'],
                config['name'],
                SingleModelEndpointBuilder,
                SingleModelEntityBuilder,
            )

    def _builder_settings(self):
        # MultipleModel
        for setting in self._settings:
            self._builder_entity(
                setting['name'],
                setting['entity'],
                'settings',
                MultipleModelEndpointBuilder,
                MultipleModelEntityBuilder,
            )

    def _builder_inputs(self):
        # DataInput
        for input_item in self._inputs:
            self._builder_entity(
                None,
                input_item['entity'],
                input_item['name'],
                DataInputEndpointBuilder,
                DataInputEntityBuilder,
                input_type=input_item['name'],
            )

    def _builder_entity(
            self,
            name,
            content,
            endpoint,
            endpoint_builder,
            entity_builder,
            *args,
            **kwargs
    ):
        endpoint_obj = self._get_endpoint(
            endpoint,
            endpoint_builder,
            *args,
            **kwargs
        )
        fields = self._parse_fields(content)
        entity = entity_builder(name, fields, *args, **kwargs)
        endpoint_obj.add_entity(entity)

    def _parse_fields(self, fields_content):
        return [
            self._parse_field(field)
            for field in fields_content
            if field['field'] != 'name'
        ]

    def _get_endpoint(self, name, endpoint_builder, *args, **kwargs):
        if name not in self._endpoints:
            endpoint = endpoint_builder(
                name=name,
                namespace=self._meta['restRoot'],
                *args,
                **kwargs
            )
            self._endpoints[name] = endpoint
        return self._endpoints[name]

    def _parse_field(self, content):
        field = RestField(
            content['field'],
            required=is_true(content.get('required')),
            encrypted=is_true(content.get('encrypted')),
            default=content.get('defaultValue'),
        )
        return RestFieldBuilder(
            field,
            self._parse_validation(content.get('validators')),
        )

    def _parse_validation(self, validation):
        global_config_validation = GlobalConfigValidation(validation)
        return global_config_validation.build()


class GlobalConfigValidation(object):

    _validation_template = """validator.{validator}({arguments})"""

    def __init__(self, validation):
        self._validators = []
        self._validation = validation

    def build(self):
        if not self._validation:
            return None
        for item in self._validation:
            parser = GlobalConfigValidation.validation_mapping.get(item['type'], None)
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
            return ''
        args = map(
            lambda (k, v): '{}={}, '.format(k, v),
            kwargs.items(),
        )
        args.insert(0, '')
        args.append('')
        return indent('\n'.join(args))

    @classmethod
    def _content(cls, validator, arguments):
        pass

    @classmethod
    def string(cls, validation):
        return (
            'String',
            {
                'min_len': validation.get('minLength'),
                'max_len': validation.get('maxLength')
            }
        )

    @classmethod
    def number(cls, validation):
        ranges = validation.get('range', [None, None])
        return (
            'Number',
            {
                'min_val': ranges[0],
                'max_val': ranges[1]
            }
        )

    @classmethod
    def regex(cls, validation):
        return (
            'Pattern',
            {'regex': 'r' + quote_regex(validation.get('pattern'))}
        )

    @classmethod
    def email(cls, validation):
        regex = (
            '^[a-zA-Z0-9.!#$%&\'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}'
            '[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'
        )
        return (
            'Pattern',
            {'regex': 'r' + quote_regex(regex)}
        )

    @classmethod
    def ipv4(cls, validation):
        regex = (
            '^(?:(?:[0-1]?\d{1,2}|2[0-4]\d|25[0-5])(?:\.|$)){4}$'
        )
        return (
            'Pattern',
            {'regex': 'r' + quote_regex(regex)}
        )

    @classmethod
    def date(cls, validation):
        # TODO: keep the same logic with front end
        regex = '.*'
        return (
            'Pattern',
            {'regex': 'r' + quote_regex(regex)}
        )

    @classmethod
    def url(cls, validation):
        regex = (
            '^(?:(?:https?|ftp|opc.tcp):\/\/)?(?:\S+(?::\S*)?@)?'
            '(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})'
            '(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})'
            '(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})'
            '(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])'
            '(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}'
            '(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|'
            '(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)'
            '(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*'
            '(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$'
        )
        return (
            'Pattern',
            {'regex': 'r' + quote_regex(regex)}
        )

    @classmethod
    def multiple_validators(cls, validators):
        validators_str = ', \n'.join(validators)
        _template = """validator.AllOf(\n{validators}\n)"""
        return _template.format(
            validators=indent(validators_str),
        )

GlobalConfigValidation.validation_mapping = {
    'string': GlobalConfigValidation.string,
    'number': GlobalConfigValidation.number,
    'regex': GlobalConfigValidation.regex,
    'email': GlobalConfigValidation.email,
    'ipv4': GlobalConfigValidation.ipv4,
    'date': GlobalConfigValidation.date,
    'url': GlobalConfigValidation.url
}


class GlobalConfigPostProcessor(object):
    """
    Post process for REST builder.
    """

    output_local = 'local'
    _import_declare_template = """
import {import_declare_name}
"""

    _import_declare_content = """
import os
import sys
import re

ta_name = '{ta_name}'
pattern = re.compile(r'[\\\\/]etc[\\\\/]apps[\\\\/][^\\\\/]+[\\\\/]bin[\\\\/]?$')
new_paths = [path for path in sys.path if not pattern.search(path) or ta_name in path]
new_paths.insert(0, os.path.dirname(__file__))
sys.path = new_paths
"""

    def __init__(self):
        self.builder = None
        self.schema = None
        self.import_declare_name = None

    @property
    def root_path(self):
        return getattr(self.builder.output, '_path')

    def third_path(self):
        return self.schema.namespace

    def requirements(self):
        third_path = op.join(
            self.root_path,
            self.builder.output.bin,
            self.third_path(),
        )
        os.makedirs(third_path)
        shutil.move(
            op.join(
                self.root_path,
                self.builder.output.bin,
                'requirements.txt',
            ),
            op.join(
                self.root_path,
                self.builder.output.bin,
                self.third_path(),
                'requirements.txt',
            ),
        )

    def default_to_local(self):
        shutil.move(
            op.join(
                self.root_path,
                self.builder.output.default,
            ),
            op.join(
                self.root_path,
                self.output_local,
            ),
        )

    def import_declare_py_name(self):
        if self.import_declare_name:
            return self.import_declare_name
        return '{}_import_declare'.format(self.schema.namespace)

    def import_declare_py_content(self):
        import_declare_file = op.join(
            self.root_path,
            self.builder.output.bin,
            self.import_declare_py_name() + '.py',
        )
        content = self._import_declare_content.format(
            ta_name=self.schema.namespace,
        )
        with open(import_declare_file, 'w') as f:
            f.write(content)

    def import_declare(self, rh_file):
        with open(rh_file) as f:
            cont = [l for l in f]
        import_declare = self._import_declare_template.format(
            import_declare_name=self.import_declare_py_name()
        )
        cont.insert(0, import_declare)
        with open(rh_file, 'w') as f:
            f.write(''.join(cont))

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
                getattr(builder.output, '_path'),
                builder.output.bin,
                endpoint.rh_name + '.py'
            )
            self.import_declare(rh_file)
        self.requirements()
        self.default_to_local()
