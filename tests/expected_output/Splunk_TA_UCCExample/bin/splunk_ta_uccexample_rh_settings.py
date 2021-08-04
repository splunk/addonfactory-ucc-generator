
import import_declare_test

from splunktaucclib.rest_handler.endpoint import (
    field,
    validator,
    RestModel,
    MultipleModel,
)
from splunktaucclib.rest_handler import admin_external, util
from splunktaucclib.rest_handler.admin_external import AdminExternalHandler
import logging

util.remove_http_proxy_env_vars()


fields_proxy = [
    field.RestField(
        'proxy_enabled',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'proxy_type',
        required=False,
        encrypted=False,
        default='http',
        validator=None
    ), 
    field.RestField(
        'proxy_url',
        required=False,
        encrypted=False,
        default=None,
        validator=validator.String(
            max_len=4096, 
            min_len=0, 
        )
    ), 
    field.RestField(
        'proxy_port',
        required=False,
        encrypted=False,
        default=None,
        validator=validator.Number(
            max_val=65535, 
            min_val=1, 
        )
    ), 
    field.RestField(
        'proxy_username',
        required=False,
        encrypted=False,
        default=None,
        validator=validator.String(
            max_len=50, 
            min_len=0, 
        )
    ), 
    field.RestField(
        'proxy_password',
        required=False,
        encrypted=True,
        default=None,
        validator=validator.String(
            max_len=8192, 
            min_len=0, 
        )
    ), 
    field.RestField(
        'proxy_rdns',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    )
]
model_proxy = RestModel(fields_proxy, name='proxy')


fields_logging = [
    field.RestField(
        'loglevel',
        required=False,
        encrypted=False,
        default='INFO',
        validator=None
    )
]
model_logging = RestModel(fields_logging, name='logging')


fields_custom_abc = [
    field.RestField(
        'testString',
        required=False,
        encrypted=False,
        default=None,
        validator=validator.String(
            max_len=10, 
            min_len=5, 
        )
    ), 
    field.RestField(
        'testNumber',
        required=False,
        encrypted=False,
        default=None,
        validator=validator.Number(
            max_val=10, 
            min_val=1, 
        )
    ), 
    field.RestField(
        'testRegex',
        required=False,
        encrypted=False,
        default=None,
        validator=validator.Pattern(
            regex=r"""^\w+$""", 
        )
    ), 
    field.RestField(
        'testEmail',
        required=False,
        encrypted=False,
        default=None,
        validator=validator.Pattern(
            regex=r"""^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$""", 
        )
    ), 
    field.RestField(
        'testIpv4',
        required=False,
        encrypted=False,
        default=None,
        validator=validator.Pattern(
            regex=r"""^(?:(?:[0-1]?\d{1,2}|2[0-4]\d|25[0-5])(?:\.|$)){4}$""", 
        )
    ), 
    field.RestField(
        'testDate',
        required=False,
        encrypted=False,
        default=None,
        validator=validator.Pattern(
            regex=r"""^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$""", 
        )
    ), 
    field.RestField(
        'testUrl',
        required=False,
        encrypted=False,
        default=None,
        validator=validator.Pattern(
            regex=r"""^(?:(?:https?|ftp|opc\.tcp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?_?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))?)(?::\d{2,5})?(?:\/[^\s]*)?$""", 
        )
    )
]
model_custom_abc = RestModel(fields_custom_abc, name='custom_abc')


endpoint = MultipleModel(
    'splunk_ta_uccexample_settings',
    models=[
        model_proxy, 
        model_logging, 
        model_custom_abc
    ],
)


if __name__ == '__main__':
    logging.getLogger().addHandler(logging.NullHandler())
    admin_external.handle(
        endpoint,
        handler=AdminExternalHandler,
    )
