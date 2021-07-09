#
# Copyright 2021 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import json
import os
import unittest

import tests.unit.helpers as helpers
from splunk_add_on_ucc_framework.global_config_validator import (
    GlobalConfigValidator,
    GlobalConfigValidatorException,
)


def _path_to_source_dir() -> str:
    return os.path.join(
        os.getcwd(),
        "splunk_add_on_ucc_framework",
    )


class ConfigValidationTest(unittest.TestCase):
    def test_config_validation_when_valid_config_then_no_exception(self):
        config = helpers.get_testdata_file("valid_config.json")
        config = json.loads(config)
        validator = GlobalConfigValidator(_path_to_source_dir(), config)
        validator.validate()

    def test_config_validation_when_invalid_config_then_exception(self):
        config = helpers.get_testdata_file("invalid_config_no_configuration_tabs.json")
        config = json.loads(config)
        validator = GlobalConfigValidator(_path_to_source_dir(), config)
        with self.assertRaises(GlobalConfigValidatorException):
            validator.validate()

    def test_config_validation_when_configuration_tab_table_has_no_name_field(self):
        config = helpers.get_testdata_file(
            "invalid_config_no_name_field_in_configuration_tab_table.json"
        )
        config = json.loads(config)
        validator = GlobalConfigValidator(_path_to_source_dir(), config)
        with self.assertRaises(GlobalConfigValidatorException):
            validator.validate()
