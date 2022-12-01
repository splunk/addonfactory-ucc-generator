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


from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.base import indent
from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.single_model import (
    RestEndpointBuilder,
    RestEntityBuilder,
)


class MultipleModelEntityBuilder(RestEntityBuilder):
    @property
    def name_spec(self):
        return self.name

    @property
    def name_default(self):
        return self.name

    @property
    def name_rh(self):
        return "_" + self._name


class MultipleModelEndpointBuilder(RestEndpointBuilder):

    _rh_template = """
from splunktaucclib.rest_handler.endpoint import (
    field,
    validator,
    RestModel,
    MultipleModel,
)
from splunktaucclib.rest_handler import admin_external, util
from {handler_module} import {handler_class}
import logging

util.remove_http_proxy_env_vars()

{entities}

endpoint = MultipleModel(
    '{conf_name}',
    models=[
{models}
    ],
)


if __name__ == '__main__':
    logging.getLogger().addHandler(logging.NullHandler())
    admin_external.handle(
        endpoint,
        handler={handler_class},
    )
"""

    def actions(self):
        return ["edit", "list"]

    def generate_rh(self):
        entities = [entity.generate_rh() for entity in self._entities]
        models = ["model" + entity.name_rh for entity in self._entities]
        models_lines = ", \n".join(models)
        return self._rh_template.format(
            handler_module=self.rh_module,
            handler_class=self.rh_class,
            entities="\n".join(entities),
            models=indent(models_lines, 2),
            conf_name=self.conf_name,
        )
