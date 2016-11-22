
from splunktaucclib.rest_handler.admin_external import handle
from splunktaucclib.rest_handler.model import field, DataInputModel
from splunktaucclib.rest_handler.model import converter


fields = [
    field.RestField(
        'account',
        required=True
    ),
    field.RestField(
        'app_id'
    ),
    field.RestField(
        'start_offset'
    ),
    # meta fields
    field.RestField(
        'index'
    ),
    field.RestField(
        'disabled',
        converter=converter.Boolean()
    )
]

model = DataInputModel(
    'splunk_ta_crowdstrike_input_02',
    fields
)


if __name__ == '__main__':
    handle(model)
