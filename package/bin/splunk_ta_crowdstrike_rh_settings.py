
from splunktaucclib.rest_handler.admin_external import handle
from splunktaucclib.rest_handler.model import field, MultipleModel
from splunktaucclib.rest_handler.model import converter, validator


fields_proxy = [
    field.RestField(
        'proxy_url',
        validator=validator.AllOf(
            validator.Host(),
            validator.RequiresIf(['proxy_port'])
        )
    ),
    field.RestField(
        'proxy_port',
        validator=validator.AllOf(
            validator.Port(),
            validator.RequiresIf(['proxy_url'])
        )
    ),
    field.RestField(
        'proxy_username',
        validator=validator.RequiresIf(
            ['proxy_password', 'proxy_url', 'proxy_port']
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
    )
]

fields_logging = [
    field.RestField(
        'loglevel',
        required=True,
        default='INFO',
        validator=validator.Enum(
            ('DEBUG', 'INFO', 'ERROR')
        )
    )
]

real_fields = {
    'proxy': fields_proxy,
    'logging': fields_logging
}

model = MultipleModel(
    'splunk_ta_crowdstrike_settings',
    real_fields
)


if __name__ == '__main__':
    handle(model)
