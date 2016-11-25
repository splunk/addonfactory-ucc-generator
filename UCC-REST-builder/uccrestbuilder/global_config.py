"""
Global config schema.
"""

from __future__ import absolute_import

import traceback
from solnlib.utils import is_true
from splunktaucclib.rest_handler.model.field import RestField

from .builder import RestBuilderError, RestSchema
from .endpoint import (
    RestFieldBuilder,
    RestEntityBuilder,
    RestEndpointBuilder,
    datainput,
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
            if len(parts) > 1:
                configuration_name = parts[1]
            else:
                configuration_name = RestEntityBuilder.WILDCARD_NAME
            self._parse_entity(
                configuration_name,
                configuration['entity'],
                endpoint_name,
            )

    def _parse_inputs(self, inputs):
        if not inputs:
            return
        for input_item in inputs['services']:
            parts = input_item['name'].split('/')
            endpoint_name = parts[0]
            if len(parts) > 1:
                input_name = parts[1]
            else:
                input_name = RestEntityBuilder.WILDCARD_NAME
            self._parse_input_entity(
                input_name,
                input_item['entity'],
                endpoint_name,
                input_item['name'],
            )

    def _parse_entity(self, name, content, endpoint):
        endpoint_obj = self._get_endpoint(
            endpoint,
            RestEndpointBuilder,
        )
        fields = [self._parse_field(field) for field in content]
        entity = RestEntityBuilder(name, fields)
        endpoint_obj.add_entity(entity)

    def _parse_input_entity(self, name, content, endpoint, input_type):
        endpoint_obj = self._get_endpoint(
            endpoint,
            datainput.DataInputEndpointBuilder,
            input_type=input_type,
        )
        fields = [self._parse_field(field) for field in content]
        entity = datainput.DataInputEntityBuilder(name, fields, input_type)
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
