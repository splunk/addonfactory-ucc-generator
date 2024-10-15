
import import_declare_test

from splunktaucclib.rest_handler.endpoint import (
    field,
    validator,
    RestModel,
    DataInputModel,
)
from splunktaucclib.rest_handler import admin_external, util
from splunktaucclib.rest_handler.admin_external import AdminExternalHandler
import logging

util.remove_http_proxy_env_vars()


fields = [
    field.RestField(
        'interval',
        required=True,
        encrypted=False,
        default=None,
        validator=validator.Pattern(
            regex=r"""^((?:-1|\d+(?:\.\d+)?)|(([\*\d{1,2}\,\-\/]+\s){4}[\*\d{1,2}\,\-\/]+))$""",
        )
    ), 
    field.RestField(
        'index',
        required=True,
        encrypted=False,
        default='default',
        validator=validator.AllOf(
            validator.Pattern(
                regex=r"""^[a-zA-Z0-9][a-zA-Z0-9\\_\\-]*$""",
            ),
            validator.String(
                max_len=80,
                min_len=1,
            )
        )
    ), 
    field.RestField(
        'account',
        required=True,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'input_two_text_hidden_for_cloud',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ),
    field.RestField(
        'input_two_text_hidden_for_enterprise',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'input_two_multiple_select',
        required=True,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'input_two_checkbox',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'input_two_radio',
        required=True,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'use_existing_checkpoint',
        required=False,
        encrypted=False,
        default='yes',
        validator=None
    ), 
    field.RestField(
        'start_date',
        required=False,
        encrypted=False,
        default=None,
        validator=validator.Pattern(
            regex=r"""^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}z)?$""", 
        )
    ), 
    field.RestField(
        'example_help_link',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ), 
    field.RestField(
        'apis',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ),
    field.RestField(
        'hide_in_ui',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ),
    field.RestField(
        'hard_disabled',
        required=False,
        encrypted=False,
        default=None,
        validator=None
    ),

    field.RestField(
        'disabled',
        required=False,
        validator=None
    )

]
model = RestModel(fields, name=None)



endpoint = DataInputModel(
    'example_input_two',
    model,
)


if __name__ == '__main__':
    logging.getLogger().addHandler(logging.NullHandler())
    admin_external.handle(
        endpoint,
        handler=AdminExternalHandler,
    )
