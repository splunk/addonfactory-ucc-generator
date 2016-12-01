"""
Global Config Module
"""

from __future__ import absolute_import

import json
import traceback
from urlparse import urlparse
from solnlib.splunk_rest_client import SplunkRestClient

from .rest_handler.schema import RestSchema, RestSchemaError
from .rest_handler.handler import RestHandler

__all__ = [
    'GlobalConfigError',
    'GlobalConfigSchema',
    'GlobalConfig',
]


class GlobalConfigError(Exception):
    pass


class GlobalConfigSchema(RestSchema):

    def __init__(self, content, *args, **kwargs):
        """

        :param content: Python object for Global Config Schema
        :param args:
        :param kwargs:
        """
        super(GlobalConfigSchema, self).__init__(*args, **kwargs)
        self._content = content
        self._inputs = []
        self._configs = []
        self._settings = []

        try:
            self._parse()
        except Exception:
            raise RestSchemaError(
                'Invalid Global Config Schema: %s' % traceback.format_exc(),
            )

    @property
    def product(self):
        return self._meta['name']

    @property
    def namespace(self):
        return self._meta['restRoot']

    @property
    def admin_match(self):
        return ''

    @property
    def version(self):
        return self._meta['uccVersion']

    @property
    def inputs(self):
        return self._inputs

    @property
    def configs(self):
        return self._configs

    @property
    def settings(self):
        return self._settings

    def _parse(self):
        self._meta = self._content['meta']
        pages = self._content['pages']
        self._parse_configuration(pages.get('configuration'))
        self._parse_inputs(pages.get('inputs'))

    def _parse_configuration(self, configurations):
        if not configurations or 'tabs' not in configurations:
            return
        for configuration in configurations['tabs']:
            if 'table' in configuration:
                self._configs.append(configuration)
            else:
                self._settings.append(configuration)

    def _parse_inputs(self, inputs):
        if not inputs or 'services' not in inputs:
            return
        self._inputs = inputs['services']


class GlobalConfig(object):

    def __init__(self, splunkd_uri, session_key, schema):
        """
        Global Config.

        :param splunkd_uri:
        :param session_key:
        :param schema:
        :type schema: GlobalConfigSchema
        """
        self._splunkd_uri = splunkd_uri
        self._session_key = session_key
        self._schema = schema

        splunkd_info = urlparse(self._splunkd_uri)
        self._client = SplunkRestClient(
            self._session_key,
            self._schema.product,
            scheme=splunkd_info.scheme,
            host=splunkd_info.hostname,
            port=splunkd_info.port,
        )

    def inputs(self, name):
        inputs = {}
        configs = self.configs()
        for input_item in self._schema.inputs:
            if name is None or input_item['name'] == name:
                input_entities = self._load_endpoint(
                    input_item['name'],
                    input_item['entity'],
                )
                self._inputs_reference(
                    input_entities,
                    input_item,
                    configs,
                )
                inputs[input_item['name']] = input_entities
        return inputs

    def configs(self, name=None):
        configs = {}
        for config in self._schema.configs:
            if name is None or config['name'] == name:
                config_entities = self._load_endpoint(
                    config['name'],
                    config['entity'],
                )
                configs[config['name']] = config_entities
        return configs

    def settings(self):
        settings = []
        for setting in self._schema.settings:
            setting_entity = self._load_endpoint(
                'settings/%s' % setting['name'],
                setting['entity'],
            )
            self._parse_multiple_select(
                setting_entity[0],
                setting['entity'],
            )
        return {'settings': settings}

    def _load_endpoint(self, name, schema):
        response = self._client.get(
            RestHandler.path_segment(self._endpoint_path(name)),
        )
        body = response.body.read()
        cont = json.loads(body)

        entities = []
        for entry in cont['entry']:
            entity = entry['content']
            entity['name'] = entry['name']
            self._parse_multiple_select(entity, schema)
            entities.append(entity)
        return entities

    @classmethod
    def _parse_multiple_select(cls, entity, schema):
        for field in schema:
            field_type = field.get('type')
            value = entity.get(field['name'])
            if field_type != 'multipleSelect' or not value:
                continue
            delimiter = schema['options']['delimiter']
            entity[field['name']] = value.split(delimiter)

    def _endpoint_path(self, name):
        return '{admin_match}/{endpoint_name}'.format(
            admin_match=self._schema.admin_match,
            endpoint_name=RestSchema.endpoint_name(
                name,
                self._schema.namespace,
            ),
        )

    @classmethod
    def _inputs_reference(
            cls,
            input_entities,
            input_item,
            configs,
    ):
        for input_entity in input_entities:
            cls._input_reference(
                input_item['name'],
                input_entity,
                input_item['entity'],
                configs,
            )

    @classmethod
    def _input_reference(
            cls,
            input_type,
            input_entity,
            input_schema,
            configs,
    ):
        for field in input_schema:
            options = field.get('options', {})
            config_type = options.get('referenceName')
            config_name = input_entity.get(field['name'])
            if not config_type or not config_name:
                continue

            for config in configs.get(config_type, []):
                if config['name'] == config_name:
                    input_entity[field['name']] = config
                    break
            else:
                raise GlobalConfigError(
                    'Config Not Found for Input, '
                    'input_type={input_type}, '
                    'input_name={input_name}, '
                    'config_type={config_type}, '
                    'config_name={config_name}, '.format(
                        input_type=input_type,
                        input_name=input_entity['name'],
                        config_type=config_type,
                        config_name=config_name,
                    )
                )
