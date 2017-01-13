
from __future__ import absolute_import

from .base import indent
from .single_model import RestEndpointBuilder, RestEntityBuilder


class MultipleModelEntityBuilder(RestEntityBuilder):

    @property
    def name_spec(self):
        return self.name

    @property
    def name_default(self):
        return self.name

    @property
    def name_rh(self):
        return '_' + self._name


class MultipleModelEndpointBuilder(RestEndpointBuilder):

    _rh_template = """
from splunktaucclib.rest_handler.endpoint import (
    field,
    validator,
    RestModel,
    MultipleModel,
)
from splunktaucclib.rest_handler import admin_external, util
from {handler_module} import {handler_name}

util.remove_http_proxy_env_vars()

{entities}

endpoint = MultipleModel(
    '{conf_name}',
    models=[
{models}
    ],
)


if __name__ == '__main__':
    admin_external.handle(
        endpoint,
        handler={handler_name},
    )
"""

    def actions(self):
        return ['edit', 'list']

    def generate_rh(self, handler):
        entities = [entity.generate_rh() for entity in self._entities]
        models = ['model' + entity.name_rh for entity in self._entities]
        models_lines = ', \n'.join(models)
        return self._rh_template.format(
            handler_module=handler.module,
            handler_name=handler.name,
            entities='\n'.join(entities),
            models=indent(models_lines, 2),
            conf_name=self.name.lower(),
        )
