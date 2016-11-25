
from __future__ import absolute_import

from . import RestEndpointBuilder, RestEntityBuilder


class DataInputEntityBuilder(RestEntityBuilder):

    def __init__(self, name, fields, input_type):
        super(DataInputEntityBuilder, self).__init__(name, fields)
        self._input_type = input_type

    @property
    def name_spec(self):
        return '{}://<name>'.format(self._input_type)

    @property
    def name_default(self):
        return self._input_type


class DataInputEndpointBuilder(RestEndpointBuilder):

    def __init__(self, name, namespace, input_type):
        super(DataInputEndpointBuilder, self).__init__(name, namespace)
        self.input_type = input_type

    @property
    def conf_name(self):
        return 'inputs'
