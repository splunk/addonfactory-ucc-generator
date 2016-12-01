import json
import os.path as op

from splunktaucclib.rest_handler.admin_external import AdminExternalHandler
from uccrestbuilder.global_config import GlobalConfigBuilderSchema
from uccrestbuilder import build

path = op.join('/', *op.realpath(__file__).split('/')[:-1])

with open(op.join(path, 'globalConfig.json')) as f:
    json_schema = ''.join([l for l in f])

schema_content = json.loads(json_schema)
schema = GlobalConfigBuilderSchema(schema_content)

builder = build(
    schema,
    AdminExternalHandler,
    './output/Splunk_TA_crowdstrike'
)
print builder.requirements
print builder.restmap_admin
print builder.restmap_admin_externals
