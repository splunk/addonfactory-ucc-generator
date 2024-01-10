#
# Copyright 2024 Splunk Inc.
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
from typing import Sequence

from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.base import (
    RestEndpointBuilder,
)


class WebConf:
    _template = """
[expose:{name}]
pattern = {name}
methods = POST, GET
"""

    _specified_template = """
[expose:{name}_specified]
pattern = {name}/*
methods = POST, GET, DELETE
"""

    @classmethod
    def build(cls, endpoints: Sequence[RestEndpointBuilder]) -> str:
        stanzas = []
        for endpoint in endpoints:
            stanzas.append(
                cls._template.format(
                    namespace=endpoint.namespace,
                    name=endpoint.name,
                )
            )
            stanzas.append(
                cls._specified_template.format(
                    namespace=endpoint.namespace,
                    name=endpoint.name,
                )
            )
        return "".join(stanzas)
