import json
import os
from splunktaucclib.global_config import GlobalConfig, GlobalConfigSchema
from solnlib.credentials import get_session_key

basedir = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(os.path.dirname(basedir), 'globalConfig.json')) as f:
    json_schema = ''.join([l for l in f])

schema = GlobalConfigSchema(json.loads(json_schema))

global_config = GlobalConfig(
    'https://127.0.0.1:8089',
    get_session_key('admin', 'admin'),
    schema
)

# get the inputs
print global_config.inputs()
# get the configs: (account etc.)
print global_config.configs()
# get the settings (logging, proxy etc.)
print global_config.settings()
