
import os.path as op

from splunktaucclib.global_config import GlobalConfigScheme
from splunktaucclib.rest_handler.admin_external import AdminExternalHandler
from splunktaucclib.rest_handler.builder import build


path = op.join('/', *__file__.split('/')[:-1])

with open(op.join(path, 'globalConfig.json')) as f:
    json_scheme = ''.join([l for l in f])


scheme = GlobalConfigScheme(json_scheme)

builder = build(
    scheme,
    AdminExternalHandler,
    op.join(path, 'output')
)
print builder.requirements
print builder.restmap_admin
print builder.restmap_admin_externals
