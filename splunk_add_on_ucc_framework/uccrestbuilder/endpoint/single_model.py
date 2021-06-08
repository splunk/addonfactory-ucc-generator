#
# Copyright 2021 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#



from .base import RestEntityBuilder, RestEndpointBuilder


class SingleModelEntityBuilder(RestEntityBuilder):
    def __init__(self, name, fields, **kwargs):
        super(SingleModelEntityBuilder, self).__init__(name, fields, **kwargs)

    @property
    def name_spec(self):
        return "<name>"

    @property
    def name_default(self):
        return "default"

    @property
    def name_rh(self):
        return ""


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
import logging

util.remove_http_proxy_env_vars()

{entity}

endpoint = SingleModel(
    '{conf_name}',
    model,
    config_name='{config_name}'
)


if __name__ == '__main__':
    logging.getLogger().addHandler(logging.NullHandler())
    admin_external.handle(
        endpoint,
        handler={handler_name},
    )
"""

    def actions(self):
        return ["edit", "list", "remove", "create"]

    def generate_rh(self, handler):
        entity = self._entities[0]
        return self._rh_template.format(
            handler_module=handler.module,
            handler_name=handler.name,
            entity=entity.generate_rh(),
            conf_name=self.conf_name,
            config_name=self._name,
        )
