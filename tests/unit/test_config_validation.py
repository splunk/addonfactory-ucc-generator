import json
import os.path
import unittest

import jsonschema

from splunk_add_on_ucc_framework import validate_config_against_schema


def _get_config(config_name: str) -> dict:
    config_path = os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "testdata", config_name
    )
    with open(config_path, "r") as f_config:
        valid_config_raw = f_config.read()
        return json.loads(valid_config_raw)


class ConfigValidationTest(unittest.TestCase):
    def test_config_validation_when_valid_config_then_no_exception(self):
        config = _get_config("valid_config.json")
        validate_config_against_schema(config)

    def test_config_validation_when_invalid_config_then_exception(self):
        config = _get_config("invalid_config_no_configuration_tabs.json")
        with self.assertRaises(jsonschema.ValidationError):
            validate_config_against_schema(config)
