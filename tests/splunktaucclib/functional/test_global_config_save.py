import unittest
import json
import os
from splunk_add_on_ucc_framework.splunktaucclib.global_config import (
    GlobalConfig,
    GlobalConfigSchema,
)
from solnlib.credentials import get_session_key

basedir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(
    os.path.join(os.path.dirname(basedir), "splunktaucclib/globalConfig.json")
) as f:
    json_schema = "".join([l for l in f])

schema = GlobalConfigSchema(json.loads(json_schema))

global_config = GlobalConfig(
    "https://127.0.0.1:8089", get_session_key("admin", "admin"), schema
)


class TestCreateFunction(unittest.TestCase):
    """
        Use the same globalConfig.json under ta-ui-framework
        Place it under UCC-REST-lib folder

    """

    def testSaveConfig(self):
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
        save_results = global_config.save(payload)
        for result in save_results:
            self.assertEqual(result, None)
