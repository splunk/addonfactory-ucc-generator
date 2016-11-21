
from __future__ import absolute_import


rhs = {
    'account': """

from splunktaucclib.rest_handler.admin_external import handle
from splunktaucclib.rest_handler.model import field, SingleModel


fields = [
    field.RestField(
        'endpoint',
        default='https://firehose.crowdstrike.com/sensors/entities/datafeed/v1'
    ),
    field.RestField(
        'api_uuid',
        required=True
    ),
    field.RestField(
        'api_key',
        required=True
    )
]

model = SingleModel(
    'splunk_ta_crowdstrike_accounts',
    fields,
)


if __name__ == '__main__':
    handle(model)
""",
    'settings': """

from splunktaucclib.rest_handler.admin_external import handle
from splunktaucclib.rest_handler.model import field, MultipleModel
from splunktaucclib.rest_handler.model import converter, validator


fields_proxy = [
    field.RestField(
        'proxy_url',
        validator=validator.AllOf(
            validator.Host(),
            validator.RequiresIf(['proxy_port'])
        ),
    ),
    field.RestField(
        'proxy_port',
        validator=validator.AllOf(
            validator.Port(),
            validator.RequiresIf(['proxy_url'])
        ),
    ),
    field.RestField(
        'proxy_username',
        validator=validator.RequiresIf(
            ['proxy_password', 'proxy_url', 'proxy_port'],
        )
    ),
    field.RestField(
        'proxy_password',
        encrypted=True,
        validator=validator.RequiresIf(['proxy_username'])
    ),
    field.RestField(
        'proxy_rnds',
        default='0',
        converter=converter.Boolean()
    ),
    field.RestField(
        'proxy_type',
        default='http',
        validator=validator.Enum(
            ('socks4', 'socks4', 'http'),
        )
    ),
    field.RestField(
        'proxy_enabled',
        converter=converter.Boolean()
    ),
]

fields_logging = [
    field.RestField(
        'loglevel',
        required=True,
        default='INFO',
        validator=validator.Enum(
            ('DEBUG', 'INFO', 'ERROR')
        )
    ),
]

real_fields = {
    'proxy': fields_proxy,
    'logging': fields_logging,
}

model = MultipleModel(
    'splunk_ta_crowdstrike_settings',
    real_fields,
)


if __name__ == '__main__':
    handle(model)
""",
    'inputs_01': """

from splunktaucclib.rest_handler.admin_external import handle
from splunktaucclib.rest_handler.model import field, DataInputModel
from splunktaucclib.rest_handler.model import converter


fields = [
    field.RestField(
        'account',
        required=True,
    ),
    field.RestField(
        'app_id',
    ),
    field.RestField(
        'start_offset',
    ),
    # meta fields
    field.RestField(
        'index',
        required=True,
    ),
    field.RestField(
        'disabled',
        converter=converter.Boolean(),
    ),
]

model = DataInputModel(
    'splunk_ta_crowdstrike_input_01',
    fields,
)


if __name__ == '__main__':
    handle(model)
""",
    'inputs_02': """

from splunktaucclib.rest_handler.admin_external import handle
from splunktaucclib.rest_handler.model import field, DataInputModel
from splunktaucclib.rest_handler.model import converter


fields = [
    field.RestField(
        'account',
        required=True,
    ),
    field.RestField(
        'app_id',
    ),
    field.RestField(
        'start_offset',
    ),
    # meta fields
    field.RestField(
        'index',
        required=True,
    ),
    field.RestField(
        'disabled',
        converter=converter.Boolean(),
    ),
]

model = DataInputModel(
    'splunk_ta_crowdstrike_input_01',
    fields,
)


if __name__ == '__main__':
    handle(model)
"""
}


class RestFieldBuilder(object):

    _template = '{name} = {value}'

    def __init__(self, field):
        self._field = field

    def generate_spec(self):
        return self._template.format(
            name=self._field.name,
            value='',
        )

    def generate_default(self):
        return self._template.format(
            name=self._field.name,
            value=self._field.default or '',
        )

    def generate_field(self):
        return ''


class RestEntityBuilder(object):

    WILDCARD_NAME = '*'

    _title_template = '[{}]'

    def __init__(self, name, fields):
        self._name = name
        self._fields = fields

    @property
    def name_spec(self):
        if self._name == RestEntityBuilder.WILDCARD_NAME:
            name = '<name>'
        else:
            name = self._name
        return name

    @property
    def name_default(self):
        if self._name == RestEntityBuilder.WILDCARD_NAME:
            name = 'default'
        else:
            name = self._name
        return name

    def generate_spec(self):
        title = self._title_template.format(self.name_spec)
        lines = [field.generate_spec() for field in self._fields]
        lines.insert(0, title)
        return '\n'.join(lines)

    def generate_default(self):
        title = self._title_template.format(self.name_default)
        lines = [field.generate_default() for field in self._fields]
        lines.insert(0, title)
        return '\n'.join(lines)


class RestEndpointBuilder(object):

    def __init__(self, name, namespace):
        self._name = name
        self._namespace = namespace
        self._entities = []

    @property
    def name(self):
        return '{}_{}'.format(self._namespace, self._name)

    @property
    def namespace(self):
        return self._namespace

    @property
    def conf_name(self):
        return self.name

    @property
    def rh_name(self):
        return '{}_rh_{}'.format(self._namespace, self._name)

    @property
    def actions(self):
        return ['edit', 'list', 'remove', 'create']

    @property
    def entities(self):
        return self._entities

    def add_entity(self, entity):
        self._entities.append(entity)

    def generate_spec(self):
        specs = [entity.generate_spec() for entity in self._entities]
        return '\n\n'.join(specs)

    def generate_default(self):
        specs = [entity.generate_default() for entity in self._entities]
        return '\n\n'.join(specs)

    def generate_rh(self, handler):
        return rhs[self._name]
