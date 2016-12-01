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
            validator=self._parse_validation(content.get('validators')),
        )
        return RestFieldBuilder(field)

    def _parse_validation(self, validation):
        return None
