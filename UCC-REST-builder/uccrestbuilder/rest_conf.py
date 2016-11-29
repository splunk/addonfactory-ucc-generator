from __future__ import absolute_import


class RestmapConf(object):

    _admin_template = """
[admin:{namespace}]
match = /
members = {endpoints}
"""

    _external_template = """
[admin_external:{name}]
handlertype = python
handlerfile = {rh_name}.py
handleractions = {actions}
"""

    @classmethod
    def build(cls, endpoints, namespace):
        if not endpoints:
            return ''
        externals = [
            cls._admin_template.format(
                namespace=namespace,
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
        return ''.join(stanzas)
