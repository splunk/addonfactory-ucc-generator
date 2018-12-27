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

# manage the inputs
inputs = global_config.inputs
print inputs.load()
payload = {
    'modinput_02': [
        {
            'name': '02-01',
            'certification': '1234567890',
        },
    ],
    'modinput_01': [
        {
            'name': '01-04',
            'account': 'account-name',
            'apis': ['1234567890', '1234567890', '1234567890'],
            'certification': '1234567890',
            'datetime': '1970-01-01 00:00:00',
        },
    ]
}
print inputs.save(payload)

# manage the configs: (account etc.)
configs = global_config.configs
print configs.load()

# manage the settings (logging, proxy etc.)
settings = global_config.settings
print settings.load()
payload = {
    'settings': [
        {
            'name': 'proxy',
            'proxy_host': '1.2.3.4',
            'proxy_port': '5678',
        },
        {
            'name': 'logging',
            'level': 'DEBUG',
        }
    ]
}
print settings.save(payload)
