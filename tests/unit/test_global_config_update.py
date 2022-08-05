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

import tests.unit.helpers as helpers
from splunk_add_on_ucc_framework.global_config_update import (
    _handle_biased_terms_update,
    _handle_dropping_api_version_update,
)


def test_handle_biased_terms_update():
    config = helpers.get_testdata_file("config_with_biased_terms.json")
    config = json.loads(config)
    updated_config = _handle_biased_terms_update(config)
    expected_schema_version = "0.0.1"
    assert expected_schema_version == updated_config["meta"]["schemaVersion"]
    input_entity_1_options_keys = updated_config["pages"]["inputs"]["services"][0][
        "entity"
    ][0]["options"].keys()
    assert "denyList" in input_entity_1_options_keys
    assert "blackList" not in input_entity_1_options_keys
    input_entity_2_options_keys = updated_config["pages"]["inputs"]["services"][0][
        "entity"
    ][1]["options"].keys()
    assert "allowList" in input_entity_2_options_keys
    assert "whileList" not in input_entity_2_options_keys
    configuration_entity_1_options_keys = updated_config["pages"]["configuration"][
        "tabs"
    ][0]["entity"][0]["options"].keys()
    assert "denyList" in configuration_entity_1_options_keys
    assert "blackList" not in configuration_entity_1_options_keys
    configuration_entity_2_options_keys = updated_config["pages"]["configuration"][
        "tabs"
    ][0]["entity"][1]["options"].keys()
    assert "allowList" in configuration_entity_2_options_keys
    assert "whileList" not in configuration_entity_2_options_keys


def test_handle_dropping_api_version_update():
    config = helpers.get_testdata_file("config_with_biased_terms.json")
    config = json.loads(config)
    updated_config = _handle_dropping_api_version_update(config)
    expected_schema_version = "0.0.3"
    assert expected_schema_version == updated_config["meta"]["schemaVersion"]
    assert "apiVersion" not in updated_config["meta"]
