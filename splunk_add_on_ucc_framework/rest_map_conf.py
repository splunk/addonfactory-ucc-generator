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
from typing import Sequence

from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.base import (
    RestEndpointBuilder,
)


class RestmapConf:
    _admin_template = """
[admin:{namespace}]
match = /
members = {endpoints}
"""

    _external_template = """
[admin_external:{name}]
handlertype = python
python.version = python3
handlerfile = {rh_name}.py
handleractions = {actions}
handlerpersistentmode = true
"""

    @classmethod
    def build(cls, endpoints: Sequence[RestEndpointBuilder], namespace: str) -> str:
        externals = [
            cls._admin_template.format(
                namespace=namespace,
                endpoints=", ".join([ep.name for ep in endpoints]),
            )
        ]
        for endpoint in endpoints:
            external = cls._external_template.format(
                name=endpoint.name,
                rh_name=endpoint.rh_name,
                actions=", ".join(endpoint.actions()),
            )
            externals.append(external)
        return "".join(externals)
