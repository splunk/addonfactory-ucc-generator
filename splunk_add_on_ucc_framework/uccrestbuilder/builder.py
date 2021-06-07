# SPDX-FileCopyrightText: 2020 2020
#
# SPDX-License-Identifier: Apache-2.0



from builtins import object
import os
import os.path as op
from .rest_conf import RestmapConf, WebConf

__all__ = [
    'RestBuilderError',
    'RestBuilder'
]


class RestBuilderError(Exception):
    pass


class _RestBuilderOutput(object):

    readme = 'README'
    default = 'default'
    bin = 'bin'

    def __init__(self, path, product):
        self._path = path
        self._product = product
        self._root_path = op.abspath(self._path)
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
        for full_name, contents in list(self._content.items()):
            full_content = '\n\n'.join(contents)
            with open(full_name, 'w') as f:
                f.writelines(full_content)


class RestBuilder(object):

    def __init__(
            self,
            schema,
            handler,
            output_path,
            *args,
            **kwargs
    ):
        """

        :param schema:
        :param schema: RestSchema
        :param handler:
        :param output_path:
        :param args:
        :param kwargs:
        """
        self._schema = schema
        self._handler = handler
        self._output_path = output_path
        self._args = args
        self._kwargs = kwargs
        self.output = _RestBuilderOutput(
            self._output_path,
            self._schema.product,
        )

    @property
    def restmap_admin(self):
        return self._schema.namespace

    @property
    def restmap_admin_externals(self):
        return RestmapConf.admin_externals(self._schema.endpoints)

    def build(self):
        for endpoint in self._schema.endpoints:
            # If the endpoint is oauth, which is for getting accesstoken. Conf file entries should not get created.
            if endpoint._name != "oauth":
                if endpoint._name == 'settings':
                    self.output.put(
                        self.output.default,
                        endpoint.conf_name + '.conf',
                        endpoint.generate_default_conf(),
                    )

                self.output.put(
                    self.output.readme,
                    endpoint.conf_name + '.conf.spec',
                    endpoint.generate_spec(),
                )

                # Add data input of self defined conf to inputs.conf.spec
                if endpoint._entities[0] and endpoint._entities[0]._conf_name:
                    lines = [
                        '[' + endpoint._name + '://<name>]',
                        'placeholder = placeholder'
                    ]
                    self.output.put(
                        self.output.readme,
                        'inputs.conf.spec',
                        '\n'.join(lines)
                    )

            self.output.put(
                self.output.bin,
                endpoint.rh_name + '.py',
                endpoint.generate_rh(self._handler),
            )

        self.output.put(
            self.output.default,
            'restmap.conf',
            RestmapConf.build(
                self._schema.endpoints,
                self._schema.namespace,
                self._schema.admin_match,
            ),
        )
        self.output.put(
            self.output.default,
            'web.conf',
            WebConf.build(self._schema.endpoints),
        )
        self.output.save()
