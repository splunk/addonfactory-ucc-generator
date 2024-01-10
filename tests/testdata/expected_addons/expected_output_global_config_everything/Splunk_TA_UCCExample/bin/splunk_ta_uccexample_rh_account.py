
import import_declare_test

from splunktaucclib.rest_handler.endpoint import (
    field,
    validator,
    RestModel,
    SingleModel,
)
from splunktaucclib.rest_handler import admin_external, util
from splunktaucclib.rest_handler.admin_external import AdminExternalHandler
import logging

util.remove_http_proxy_env_vars()


fields = [
    field.RestField(
        'custom_endpoint',
        required=True,
        encrypted=False,
        default='login.example.com',
        validator=None
    ), 
        field.RestField(
        'endpoint',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ),
    field.RestField(
        'account_checkbox',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'account_radio',
        required=True,
        encrypted=False,
        default='yes',
        validator=None
    ), 
    field.RestField(
        'account_multiple_select',
        required=True,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'example_help_link',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'config1_help_link',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'config2_help_link',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'username',
        required=False,
        encrypted=False,
        default='Username',
        validator=None
    ), 
    field.RestField(
        'password',
        required=False,
        encrypted=True,
        default=None,
        validator=None
    ), 
    field.RestField(
        'token',
        required=False,
        encrypted=True,
        default=None,
        validator=None
    ), 
    field.RestField(
        'basic_oauth_text',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'client_id',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'client_secret',
        required=False,
        encrypted=True,
        default=None,
        validator=None
    ), 
    field.RestField(
        'redirect_url',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'endpoint_token',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'endpoint_authorize',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'oauth_oauth_text',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'access_token',
        required=False,
        encrypted=True,
        default=None,
        validator=None
    ), 
    field.RestField(
        'refresh_token',
        required=False,
        encrypted=True,
        default=None,
        validator=None
    ), 
    field.RestField(
        'instance_url',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'auth_type',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    )
]
model = RestModel(fields, name=None)


endpoint = SingleModel(
    'splunk_ta_uccexample_account',
    model,
    config_name='account'
)


if __name__ == '__main__':
    logging.getLogger().addHandler(logging.NullHandler())
    admin_external.handle(
        endpoint,
        handler=AdminExternalHandler,
    )
