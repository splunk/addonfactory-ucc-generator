"""
Global config schema.
"""

from __future__ import absolute_import

import os
import os.path as op
import shutil
from solnlib.utils import is_true
from splunktaucclib.global_config import GlobalConfigSchema
from splunktaucclib.rest_handler.endpoint.field import RestField

from .endpoint.field import RestFieldBuilder
from .endpoint.single_model import (
    SingleModelEntityBuilder,
    SingleModelEndpointBuilder,
)
from .endpoint.multiple_model import (
    MultipleModelEntityBuilder,
    MultipleModelEndpointBuilder,
)
from .endpoint.datainput import (
    DataInputEndpointBuilder,
    DataInputEntityBuilder,
)


class GlobalConfigBuilderSchema(GlobalConfigSchema):

    def __init__(self, content, *args, **kwargs):
        super(GlobalConfigBuilderSchema, self).__init__(
            content,
            *args,
            **kwargs
        )
        self._endpoints = {}
        self._parse_builder_schema()

    @property
    def endpoints(self):
        return [endpoint for _, endpoint in self._endpoints.iteritems()]

    def _parse_builder_schema(self):
        self._builder_configs()
        self._builder_settings()
        self._builder_inputs()

    def _builder_configs(self):
        # SingleModel
        for config in self._configs:
            self._builder_entity(
                None,
                config['entity'],
                config['name'],
                SingleModelEndpointBuilder,
                SingleModelEntityBuilder,
            )

    def _builder_settings(self):
        # MultipleModel
        for setting in self._settings:
            self._builder_entity(
                setting['name'],
                setting['entity'],
                'settings',
                MultipleModelEndpointBuilder,
                MultipleModelEntityBuilder,
            )

    def _builder_inputs(self):
        # DataInput
        for input_item in self._inputs:
            self._builder_entity(
                None,
                input_item['entity'],
                input_item['name'],
                DataInputEndpointBuilder,
                DataInputEntityBuilder,
                input_type=input_item['name'],
            )

    def _builder_entity(
            self,
            name,
            content,
            endpoint,
            endpoint_builder,
            entity_builder,
            *args,
            **kwargs
    ):
        endpoint_obj = self._get_endpoint(
            endpoint,
            endpoint_builder,
            *args,
            **kwargs
        )
        fields = self._parse_fields(content)
        entity = entity_builder(name, fields, *args, **kwargs)
        endpoint_obj.add_entity(entity)

    def _parse_fields(self, fields_content):
        return [
            self._parse_field(field)
            for field in fields_content
            if field['field'] != 'name'
        ]

    def _get_endpoint(self, name, endpoint_builder, *args, **kwargs):
        if name not in self._endpoints:
            endpoint = endpoint_builder(
                name=name,
                namespace=self._meta['restRoot'],
                *args,
                **kwargs
            )
            self._endpoints[name] = endpoint
        return self._endpoints[name]

    def _parse_field(self, content):
        field = RestField(
            content['field'],
            required=is_true(content.get('required')),
            encrypted=is_true(content.get('encrypted')),
            default=content.get('defaultValue'),
            validator=self._parse_validation(content.get('validators')),
        )
        return RestFieldBuilder(field)

    def _parse_validation(self, validation):
        return None


class GlobalConfigPostProcessor(object):
    """
    Post process for REST builder.
    """

    output_local = 'local'
    _import_declare_template = """
import {import_declare_name}
"""

    _import_declare_content = """
import os
import sys
import re

ta_name = os.path.basename(os.path.dirname(os.path.dirname(__file__)))
pattern = re.compile(r"[\\/]etc[\\/]apps[\\/][^\\/]+[\\/]bin[\\/]?$")
new_paths = [path for path in sys.path if not pattern.search(path) or ta_name in path]
new_paths.insert(0, os.path.dirname(__file__))
sys.path = new_paths
"""

    def __init__(self):
        self.builder = None
        self.schema = None

    @property
    def root_path(self):
        return getattr(self.builder.output, '_path')

    def third_path(self):
        return self.schema.namespace

    def requirements(self):
        third_path = op.join(
            self.root_path,
            self.builder.output.bin,
            self.third_path(),
        )
        os.makedirs(third_path)
        shutil.move(
            op.join(
                self.root_path,
                self.builder.output.bin,
                'requirements.txt',
            ),
            op.join(
                self.root_path,
                self.builder.output.bin,
                self.third_path(),
                'requirements.txt',
            ),
        )

    def default_to_local(self):
        shutil.move(
            op.join(
                self.root_path,
                self.builder.output.default,
            ),
            op.join(
                self.root_path,
                self.output_local,
            ),
        )

    def import_declare_name(self):
        return '{}_import_declare'.format(self.schema.namespace)

    def import_declare_content(self):
        import_declare_file = op.join(
            self.root_path,
            self.builder.output.bin,
            self.import_declare_name() + '.py',
        )
        with open(import_declare_file, 'w') as f:
            f.write(self._import_declare_content)

    def import_declare(self, rh_file):
        with open(rh_file) as f:
            cont = [l for l in f]
        import_declare = self._import_declare_template.format(
            import_declare_name=self.import_declare_name()
        )
        cont.insert(0, import_declare)
        with open(rh_file, 'w') as f:
            f.write(''.join(cont))

    def __call__(self, builder, schema):
        """
        :param builder: REST builder
        :param schema: Global Config Schema
        :return:
        """
        self.builder = builder
        self.schema = schema

        self.import_declare_content()
        for endpoint in schema.endpoints:
            rh_file = op.join(
                getattr(builder.output, '_path'),
                builder.output.bin,
                endpoint.rh_name + '.py'
            )
            self.import_declare(rh_file)
        self.requirements()
        self.default_to_local()
