"""
Global config schema.
"""

from __future__ import absolute_import

import traceback
from solnlib.utils import is_true
from splunktaucclib.rest_handler.endpoint.field import RestField

from .builder import RestBuilderError, RestSchema
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


class GlobalConfigSchema(RestSchema):

    def __init__(self, content, *args, **kwargs):
        """

        :param content: Python object for REST schema
        :param args:
        :param kwargs:
        """
        super(GlobalConfigSchema, self).__init__(*args, **kwargs)
        self._content = content
        self._endpoints = {}
        try:
            self._parse()
        except Exception:
            raise RestBuilderError(
                'Invalid JSON format: %s' % traceback.format_exc(),
            )

    @property
    def product(self):
        return self._meta['name']

    @property
    def namespace(self):
        return self._meta['restRoot']

    @property
    def version(self):
        return self._meta['uccVersion']

    @property
    def endpoints(self):
        return [endpoint for _, endpoint in self._endpoints.iteritems()]

    def _parse(self):
        self._meta = self._content['meta']
        pages = self._content['pages']
        self._parse_configuration(pages.get('configuration'))
        self._parse_inputs(pages.get('inputs'))

    def _parse_configuration(self, configurations):
        if not configurations:
            return
        for configuration in configurations['tabs']:
            parts = configuration['name'].split('/')
            endpoint_name = parts[0]
            if len(parts) <= 1:
                self._parse_single_model_entity(
                    None,
                    configuration['entity'],
                    endpoint_name,
                )
            else:
                self._parse_multiple_model_entity(
                    parts[1],
                    configuration['entity'],
                    endpoint_name,
                )

    def _parse_inputs(self, inputs):
        if not inputs:
            return
        for input_item in inputs['services']:
            self._parse_datainput_entity(
                input_item['name'],
                input_item['entity'],
            )

    def _parse_single_model_entity(self, name, content, endpoint):
        endpoint_obj = self._get_endpoint(
            endpoint,
            SingleModelEndpointBuilder,
        )
        fields = [self._parse_field(field) for field in content]
        entity = SingleModelEntityBuilder(name, fields)
        endpoint_obj.add_entity(entity)

    def _parse_multiple_model_entity(self, name, content, endpoint):
        endpoint_obj = self._get_endpoint(
            endpoint,
            MultipleModelEndpointBuilder,
        )
        fields = [self._parse_field(field) for field in content]
        entity = MultipleModelEntityBuilder(name, fields)
        endpoint_obj.add_entity(entity)

    def _parse_datainput_entity(self, input_type, content):
        endpoint_obj = self._get_endpoint(
            input_type,
            DataInputEndpointBuilder,
            input_type=input_type,
        )
        fields = [self._parse_field(field) for field in content]
        entity = DataInputEntityBuilder(input_type, fields)
        endpoint_obj.add_entity(entity)

    def _get_endpoint(self, name, endpoint_cls, *args, **kwargs):
        if name not in self._endpoints:
            endpoint = endpoint_cls(
                name=name,
                namespace=self._meta['restRoot'],
                *args,
                ** kwargs
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
