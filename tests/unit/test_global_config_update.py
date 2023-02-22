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

import pytest

import tests.unit.helpers as helpers
from splunk_add_on_ucc_framework.global_config_update import (
    _handle_biased_terms_update,
    _handle_dropping_api_version_update,
)
from splunk_add_on_ucc_framework import global_config as global_config_lib


@pytest.mark.parametrize(
    "filename,is_yaml",
    [
        ("config_with_biased_terms.json", False),
        ("config_with_biased_terms.yaml", True),
    ],
)
def test_handle_biased_terms_update(filename, is_yaml):
    global_config_path = helpers.get_testdata_file_path(filename)
    global_config = global_config_lib.GlobalConfig()
    global_config.parse(global_config_path, is_yaml)
    _handle_biased_terms_update(global_config)
    expected_schema_version = "0.0.1"
    assert expected_schema_version == global_config.schema_version
    input_entity_1_options_keys = global_config.inputs[0]["entity"][0]["options"].keys()
    assert "denyList" in input_entity_1_options_keys
    assert "blackList" not in input_entity_1_options_keys
    input_entity_2_options_keys = global_config.inputs[0]["entity"][1]["options"].keys()
    assert "allowList" in input_entity_2_options_keys
    assert "whileList" not in input_entity_2_options_keys
    configuration_entity_1_options_keys = global_config.tabs[0]["entity"][0][
        "options"
    ].keys()
    assert "denyList" in configuration_entity_1_options_keys
    assert "blackList" not in configuration_entity_1_options_keys
    configuration_entity_2_options_keys = global_config.tabs[0]["entity"][1][
        "options"
    ].keys()
    assert "allowList" in configuration_entity_2_options_keys
    assert "whileList" not in configuration_entity_2_options_keys


@pytest.mark.parametrize(
    "filename,is_yaml",
    [
        ("config_with_biased_terms.json", False),
        ("config_with_biased_terms.yaml", True),
    ],
)
def test_handle_dropping_api_version_update(filename, is_yaml):
    global_config_path = helpers.get_testdata_file_path(filename)
    global_config = global_config_lib.GlobalConfig()
    global_config.parse(global_config_path, is_yaml)
    _handle_dropping_api_version_update(global_config)
    expected_schema_version = "0.0.3"
    assert expected_schema_version == global_config.schema_version
    assert "apiVersion" not in global_config.meta
