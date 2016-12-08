import json
import os.path as op

from splunktaucclib.rest_handler.admin_external import AdminExternalHandler
from uccrestbuilder.global_config import (
    GlobalConfigBuilderSchema,
    GlobalConfigPostProcessor,
)
from uccrestbuilder import build

path = op.dirname(op.abspath(__file__))

with open(op.join(op.dirname(op.dirname(path)), 'globalConfig.json')) as f:
    json_schema = ''.join([l for l in f])

schema_content = json.loads(json_schema)
schema = GlobalConfigBuilderSchema(schema_content)

builder = build(
    schema,
    AdminExternalHandler,
    op.abspath('./output'),
    post_process=GlobalConfigPostProcessor(),
    import_declare_name='import_decalare_test',
)
print builder.requirements
print builder.restmap_admin
print builder.restmap_admin_externals
