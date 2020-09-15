import pytest
import json
import os
from splunk_add_on_ucc_framework.splunktaucclib.global_config import (
    GlobalConfig,
    GlobalConfigSchema,
)

def test_SaveConfig(get_session_key):

    payload = {
        "account": [
            {"endpoint": "abc", "api_key": "1", "name": "account0"},
            {"endpoint": "abc", "api_key": "1", "name": "account1"},
        ],
        "settings": [
            {"loglevel": "INFO", "name": "logging"},
            {"proxy_type": "http", "proxy_password": "", "name": "proxy"},
        ],
    }
    basedir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    with open(
        os.path.join(os.path.dirname(basedir), "splunktaucclib/globalConfig.json")
    ) as f:
        json_schema = "".join([l for l in f])

    schema = GlobalConfigSchema(json.loads(json_schema))

    sk = get_session_key[1]
    
    global_config = GlobalConfig(
        get_session_key[0], sk , schema
    )
    save_results = global_config.save(payload)
    for result in save_results:
        assert result is None
