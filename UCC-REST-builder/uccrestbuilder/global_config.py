"""
Global config schema.
"""

from __future__ import absolute_import

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
from .endpoint.base import indent, quote_string


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
            parser = getattr(self, item['type'], None)
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
                'max_len': validation.get('maxLength'),
            },
        )

    @classmethod
    def number(cls, validation):
        ranges = validation.get('range', [None, None])
        return (
            'Number',
            {
                'min_val': ranges[0],
                'max_val': ranges[1],
            },
        )

    @classmethod
    def regex(cls, validation):
        return (
            'Pattern',
            {'regex': 'r' + quote_string(validation['pattern'])},
        )

    @classmethod
    def email(cls, validation):
        return 'Email', None

    @classmethod
    def ipv4(cls, validation):
        regex = (
            '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}'
            '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
        )
        return (
            'Pattern',
            {'regex': 'r' + quote_string(regex)},
        )

    @classmethod
    def date(cls, validation):
        return 'Datetime', None

    @classmethod
    def url(cls, validation):
        return 'Host', None

    @classmethod
    def multiple_validators(cls, validators):
        validators_str = ', \n'.join(validators)
        _template = """validator.AllOf(\n{validators}\n)"""
        return _template.format(
            validators=indent(validators_str),
        )
