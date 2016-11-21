"""
REST Builder.
"""

from __future__ import absolute_import

import os
import os.path as op
import collections

from ... import __version__


__all__ = [
    'RestBuilderError',
    'RestBuilder',
    'RestScheme',
    'build',
]


_Lib = collections.namedtuple('_Lib', ('name', 'version'))

# requirements 3rd libs in built add-on
__requirements__ = (
    _Lib(name='solnlib', version='1.0.10'),
    _Lib(name='splunk-sdk', version='1.6.0'),
    _Lib(name='splunktaucclib', version=__version__),
)


class RestBuilderError(Exception):
    pass


class RestScheme(object):
    """
    REST Scheme.
    """

    def __init__(self, *args, **kwargs):
        pass

    @property
    def product(self):
        raise NotImplementedError()

    @property
    def namespace(self):
        raise NotImplementedError()

    @property
    def version(self):
        raise NotImplementedError()

    @property
    def endpoints(self):
        raise NotImplementedError()


class RestBuilderOutput(object):

    readme = 'README'
    default = 'default'
    bin = 'bin'

    def __init__(self, path, product):
        self._path = path
        self._product = product
        self._root_path = op.abspath(op.join(self._path, self._product))
        if not op.isdir(self._root_path):
            os.makedirs(self._root_path)
        self._content = {}

    def put(self, subpath, file_name, content):
        path = op.join(self._root_path, subpath)
        if not op.isdir(path):
            os.makedirs(path)
        full_name = op.join(path, file_name)
        if full_name not in self._content:
            self._content[full_name] = []
        self._content[full_name].append(content)

    def save(self):
        for full_name, contents in self._content.iteritems():
            full_content = '\n\n'.join(contents)
            with open(full_name, 'w') as f:
                f.writelines(full_content)


class _RestmapConfBuilder(object):

    _admin_template = """
[admin:{namespace}]
match = /{namespace}
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
                actions=', '.join(endpoint.actions),
            )
            externals.append(external)
        return ''.join(externals)

    @classmethod
    def admin_externals(cls, endpoints):
        return [endpoint.name for endpoint in endpoints]


class _WebConfBuilder(object):

    _template = """
[expose:{name}]
pattern = {namespace}/{name}
methods = POST, GET
"""

    _specified_template = """
[expose:{name}_specified]
pattern = {namespace}/{name}/*
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


class RestBuilder(object):

    def __init__(
            self,
            scheme,
            handler,
            output_path,
            *args,
            **kwargs
    ):
        """

        :param scheme:
        :param scheme: RestScheme
        :param handler:
        :param output_path:
        :param args:
        :param kwargs:
        """
        self._scheme = scheme
        self._handler = handler
        self._output_path = output_path
        self._args = args
        self._kwargs = kwargs
        self.output = RestBuilderOutput(
            self._output_path,
            self._scheme.product,
        )

    @property
    def requirements(self):
        return __requirements__

    @property
    def restmap_admin(self):
        return self._scheme.namespace

    @property
    def restmap_admin_externals(self):
        return _RestmapConfBuilder.admin_externals(self._scheme.endpoints)

    def build(self):
        for endpoint in self._scheme.endpoints:
            self.output.put(
                self.output.default,
                endpoint.conf_name + '.conf',
                endpoint.generate_default(),
            )
            self.output.put(
                self.output.readme,
                endpoint.conf_name + '.conf.spec',
                endpoint.generate_spec(),
            )
            self.output.put(
                self.output.bin,
                endpoint.rh_name + '.py',
                endpoint.generate_rh(self._handler),
            )

        self.output.put(
            self.output.default,
            'restmap.conf',
            _RestmapConfBuilder.build(
                self._scheme.endpoints,
                self._scheme.namespace,
            ),
        )
        self.output.put(
            self.output.default,
            'web.conf',
            _WebConfBuilder.build(self._scheme.endpoints),
        )
        reqs = [req.name + '==' + req.version for req in self.requirements]
        self.output.put(
            self.output.bin,
            'requirements.txt',
            '\n'.join(reqs)
        )
        self.output.save()

    def _build_restmapconf(self):
        pass

    def _build_webconf(self):
        pass


def build(scheme, handler, output_path):
    """
    Build REST for Add-on.

    :param scheme: REST scheme.
    :type scheme: RestScheme
    :param handler: REST handler class, subclass of
        ``rest_handler.RestHandler``.
    :param output_path: path for output.
    :return:
    """
    builder = RestBuilder(scheme, handler, output_path)
    builder.build()
    return builder
