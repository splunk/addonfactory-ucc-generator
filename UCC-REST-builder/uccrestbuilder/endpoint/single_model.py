
from __future__ import absolute_import

from .base import RestEntityBuilder, RestEndpointBuilder


class SingleModelEntityBuilder(RestEntityBuilder):

    def __init__(self, name, fields):
        super(SingleModelEntityBuilder, self).__init__(name, fields)

    @property
    def name_spec(self):
        return '<name>'

    @property
    def name_default(self):
        return 'default'

    @property
    def name_rh(self):
        return ''


class SingleModelEndpointBuilder(RestEndpointBuilder):

    _rh_template = """
from splunktaucclib.rest_handler.endpoint import (
    field,
    validator,
    RestModel,
    SingleModel,
)
from splunktaucclib.rest_handler import admin_external, util
from {handler_module} import {handler_name}

util.remove_http_proxy_env_vars()

{entity}

endpoint = SingleModel(
    '{conf_name}',
    model,
)


if __name__ == '__main__':
    admin_external.handle(
        endpoint,
        handler={handler_name},
    )
"""

    def actions(self):
        return ['edit', 'list', 'remove', 'create']

    def generate_rh(self, handler):
        entity = self._entities[0]
        return self._rh_template.format(
            handler_module=handler.__module__,
            handler_name=handler.__name__,
            entity=entity.generate_rh(),
            conf_name=self.name,
        )
