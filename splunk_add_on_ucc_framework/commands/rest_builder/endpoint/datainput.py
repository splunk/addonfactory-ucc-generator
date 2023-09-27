#
# Copyright 2023 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from typing import List, Optional, Any, TYPE_CHECKING

from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.single_model import (
    RestEndpointBuilder,
    RestEntityBuilder,
)

if TYPE_CHECKING:
    from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.field import (
        RestFieldBuilder,
    )


class DataInputEntityBuilder(RestEntityBuilder):
    def __init__(
        self,
        name: Optional[str],
        fields: List["RestFieldBuilder"],
        input_type: str,
        **kwargs: Any,
    ) -> None:
        super().__init__(name, fields, **kwargs)
        self._input_type = input_type

    @property
    def name_spec(self) -> str:
        return f"{self._input_type}://<name>"

    @property
    def name_rh(self) -> str:
        return ""


class DataInputEndpointBuilder(RestEndpointBuilder):
    _rh_template = """
import import_declare_test

from splunktaucclib.rest_handler.endpoint import (
    field,
    validator,
    RestModel,
    DataInputModel,
)
from splunktaucclib.rest_handler import admin_external, util
from {handler_module} import {handler_class}
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
        handler={handler_class},
    )
"""

    def __init__(
        self, name: str, namespace: str, input_type: str, **kwargs: Any
    ) -> None:
        super().__init__(name, namespace, **kwargs)
        self.input_type = input_type

    @property
    def conf_name(self) -> str:
        return "inputs"

    def actions(self) -> List[str]:
        return ["edit", "list", "remove", "create"]

    def generate_rh(self) -> str:
        entity = self._entities[0]
        return self._rh_template.format(
            handler_module=self.rh_module,
            handler_class=self.rh_class,
            entity=entity.generate_rh(),
            input_type=self.input_type,
        )
