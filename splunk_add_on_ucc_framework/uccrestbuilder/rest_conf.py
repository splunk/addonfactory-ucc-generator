# SPDX-FileCopyrightText: 2020 2020
#
# SPDX-License-Identifier: Apache-2.0

from __future__ import absolute_import


from builtins import object
class RestmapConf(object):

    _admin_template = """
[admin:{namespace}]
match = /{admin_match}
members = {endpoints}
"""

    _external_template = """
[admin_external:{name}]
handlertype = python
handlerfile = {rh_name}.py
handleractions = {actions}
handlerpersistentmode = true
"""

    @classmethod
    def build(cls, endpoints, namespace, admin_match):
        if not endpoints:
            return ''
        externals = [
            cls._admin_template.format(
                namespace=namespace,
                admin_match=admin_match,
                endpoints=', '.join([ep.name for ep in endpoints])
            )
        ]
        for endpoint in endpoints:
            external = cls._external_template.format(
                name=endpoint.name,
                rh_name=endpoint.rh_name,
                actions=', '.join(endpoint.actions()),
            )
            externals.append(external)
        return ''.join(externals)

    @classmethod
    def admin_externals(cls, endpoints):
        return [endpoint.name for endpoint in endpoints]


class WebConf(object):

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

    _internal_template = """
[expose:{name}]
pattern = {endpoint}
methods = GET
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
        # add splunkd data endpoint
        stanzas.append(
            cls._internal_template.format(
                name='_splunkd_data',
                endpoint='data/*'
            )
        )
        return ''.join(stanzas)
