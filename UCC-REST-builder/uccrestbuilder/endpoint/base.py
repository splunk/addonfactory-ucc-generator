
from __future__ import absolute_import

from StringIO import StringIO
from splunktaucclib.rest_handler.schema import RestSchema

__all__ = [
    'RestEntityBuilder',
    'RestEndpointBuilder',
    'quote_string',
    'indent',
]


class RestEntityBuilder(object):

    _title_template = '[{}]'
    _rh_template = """
fields{name_rh} = [
{fields}
]
model{name_rh} = RestModel(fields{name_rh}, name={name})
"""
    _disabled_feild_template = """
field.RestField(
    'disabled',
    required=False,
    validator=None
)
"""

    def __init__(self, name, fields, **kwargs):
        self._name = name
        self._fields = fields

    @property
    def name(self):
        return self._name

    @property
    def name_spec(self):
        raise NotImplementedError()

    @property
    def name_default(self):
        raise NotImplementedError()

    @property
    def name_rh(self):
        raise NotImplementedError()

    def generate_spec(self, omit_kv_pairs=False):
        title = self._title_template.format(self.name_spec)
        if omit_kv_pairs:
            return title
        lines = [field.generate_spec() for field in self._fields]
        lines.insert(0, title)
        return '\n'.join(lines)

    def generate_rh(self):
        fields = []
        for field in self._fields:
            field_line = field.generate_rh()
            fields.append(field_line)
        # add disabled field for data input
        if self.__class__.__name__ == 'DataInputEntityBuilder':
            fields.append(self._disabled_feild_template)
        fields_lines = ', \n'.join(fields)
        return self._rh_template.format(
            fields=indent(fields_lines),
            name_rh=self.name_rh,
            name=quote_string(self._name)
        )


class RestEndpointBuilder(object):

    def __init__(self, name, namespace, **kwargs):
        self._name = name
        self._namespace = namespace
        self._entities = []
        self._conf_name = kwargs.get('conf_name') if kwargs.get('conf_name') is not None else self.name.lower()

    @property
    def name(self):
        return RestSchema.endpoint_name(self._name, self._namespace)

    @property
    def namespace(self):
        return self._namespace

    @property
    def conf_name(self):
        return self._conf_name

    @property
    def rh_name(self):
        return '{}_rh_{}'.format(self._namespace, self._name)

    @property
    def entities(self):
        return self._entities

    def add_entity(self, entity):
        self._entities.append(entity)

    def actions(self):
        raise NotImplementedError()

    def generate_spec(self):
        specs = [entity.generate_spec() for entity in self._entities]
        return '\n\n'.join(specs)

    def generate_default_conf(self):
        specs = [entity.generate_spec(True) for entity in self._entities]
        return '\n\n'.join(specs)

    def generate_rh(self, handler):
        raise NotImplementedError()


def quote_string(value):
    """
    Quote a string
    :param value:
    :return:
    """
    if isinstance(value, basestring):
        return '\'%s\'' % value
    else:
        return value


def quote_regex(value):
    """
    Quote a regex
    :param value:
    :return:
    """
    if isinstance(value, basestring):
        return '"""%s"""' % value
    else:
        return value


def indent(lines, spaces=1):
    """
    Indent code block.

    :param lines:
    :type lines: str
    :param spaces: times of four
    :return:
    """
    string_io = StringIO(lines)
    indentation = spaces * 4
    prefix = ' ' * indentation
    lines = []
    for line in string_io:
        if line != '\n':
            line = prefix + line
        lines.append(line)
    return ''.join(lines)
