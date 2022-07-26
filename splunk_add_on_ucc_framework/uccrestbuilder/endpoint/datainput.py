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


from splunk_add_on_ucc_framework.uccrestbuilder.endpoint.single_model import (
    RestEndpointBuilder,
    RestEntityBuilder,
)


class DataInputEntityBuilder(RestEntityBuilder):
    def __init__(self, name, fields, input_type, **kwargs):
        super().__init__(name, fields, **kwargs)
        self._input_type = input_type

    @property
    def name_spec(self):
        return f"{self._input_type}://<name>"

    @property
    def name_default(self):
        return self._input_type

    @property
    def name_rh(self):
        return ""


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
import logging

util.remove_http_proxy_env_vars()

{entity}


endpoint = DataInputModel(
    '{input_type}',
    model,
)


if __name__ == '__main__':
    logging.getLogger().addHandler(logging.NullHandler())
    admin_external.handle(
        endpoint,
        handler={handler_name},
    )
"""

    def __init__(self, name, namespace, input_type, **kwargs):
        super().__init__(name, namespace, **kwargs)
        self.input_type = input_type

    @property
    def conf_name(self):
        return "inputs"

    def actions(self):
        return ["edit", "list", "remove", "create"]

    def generate_rh(self, handler):
        entity = self._entities[0]
        return self._rh_template.format(
            handler_module=handler.module,
            handler_name=handler.name,
            entity=entity.generate_rh(),
            input_type=self.input_type,
        )
