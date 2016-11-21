
from __future__ import absolute_import

import json
from solnlib.utils import is_true

from .rest_handler.model.field import RestField
from .rest_handler.builder import RestBuilderError, RestScheme
from .rest_handler.builder.endpoint import RestFieldBuilder
from .rest_handler.builder.endpoint import RestEntityBuilder
from .rest_handler.builder.endpoint import RestEndpointBuilder
from .rest_handler.builder.endpoint.datainput import DataInputEntityBuilder
from .rest_handler.builder.endpoint.datainput import DataInputEndpointBuilder


class GlobalConfigScheme(RestScheme):

    def __init__(self, json_scheme, *args, **kwargs):
        super(GlobalConfigScheme, self).__init__(*args, **kwargs)
        try:
            self._content = json.loads(json_scheme)
        except ValueError:
            raise RestBuilderError('Invalid JSON format')
        self._endpoints = {}
        self._parse()

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
        for page_type, page in self._content['pages'].iteritems():
            if page_type == 'configuration':
                self._parse_configuration(page['tabs'])
            elif page_type == 'inputs':
                self._parse_inputs(page['services'])

    def _parse_configuration(self, configurations):
        for configuration in configurations:
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
        for input_item in inputs:
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
                input_item['input_type'],
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
            DataInputEndpointBuilder,
            input_type=input_type,
        )
        fields = [self._parse_field(field) for field in content]
        entity = DataInputEntityBuilder(name, fields, input_type)
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
