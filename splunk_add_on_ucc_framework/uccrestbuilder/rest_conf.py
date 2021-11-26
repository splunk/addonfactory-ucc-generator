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


class RestmapConf:

    _admin_template = """
[admin:{namespace}]
match = /{admin_match}
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
    def build(cls, endpoints, namespace, admin_match):
        if not endpoints:
            return ""
        externals = [
            cls._admin_template.format(
                namespace=namespace,
                admin_match=admin_match,
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

    @classmethod
    def admin_externals(cls, endpoints):
        return [endpoint.name for endpoint in endpoints]


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
    def build(cls, endpoints):
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
