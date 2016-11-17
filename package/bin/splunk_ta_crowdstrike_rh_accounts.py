
from splunktaucclib.rest_handler.admin_external import handle
from splunktaucclib.rest_handler.model import field, SingleModel
from splunktaucclib.rest_handler.model import validator


fields = [
    field.RestField(
        'endpoint',
        default='https://firehose.crowdstrike.com/sensors/entities/datafeed/v1'
    ),
    field.RestField(
        'api_uuid',
        required=True,
    ),
    field.RestField(
        'api_key',
        required=True,
    ),
]

model = SingleModel(
    'splunk_ta_crowdstrike_accounts',
    fields,
)


if __name__ == '__main__':
    handle(model)
