
from __future__ import absolute_import

from .single_model import RestEndpointBuilder, RestEntityBuilder


class DataInputEntityBuilder(RestEntityBuilder):

    def __init__(self, name, fields, input_type):
        super(DataInputEntityBuilder, self).__init__(name, fields)
        self._input_type = input_type

    @property
    def name_spec(self):
        return '{}://<name>'.format(self._input_type)

    @property
    def name_default(self):
        return self._input_type

    @property
    def name_rh(self):
        return ''


class DataInputEndpointBuilder(RestEndpointBuilder):

    _rh_template = """
from splunktaucclib.rest_handler.endpoint import (
    field,
    validator,
    RestModel,
    DataInputModel,
)
from splunktaucclib.rest_handler import admin_external, util
from {handler_module} import {handler_name}

util.remove_http_proxy_env_vars()

{entity}

endpoint = DataInputModel(
    '{input_type}',
    model,
)


if __name__ == '__main__':
    admin_external.handle(
        endpoint,
        handler={handler_name},
    )
"""

    def __init__(self, name, namespace, input_type):
        super(DataInputEndpointBuilder, self).__init__(name, namespace)
        self.input_type = input_type

    @property
    def conf_name(self):
        return 'inputs'

    def actions(self):
        return ['edit', 'list', 'remove', 'create']

    def generate_rh(self, handler):
        entity = self._entities[0]
        return self._rh_template.format(
            handler_module=handler.__module__,
            handler_name=handler.__name__,
            entity=entity.generate_rh(),
            input_type=self.input_type,
        )
