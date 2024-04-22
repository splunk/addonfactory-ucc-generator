import json

import pytest

import tests.unit.helpers as helpers
from splunk_add_on_ucc_framework.global_config_update import (
    _handle_biased_terms_update,
    _handle_dropping_api_version_update,
    _handle_xml_dashboard_update,
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
    global_config = global_config_lib.GlobalConfig(global_config_path, is_yaml)
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
    global_config = global_config_lib.GlobalConfig(global_config_path, is_yaml)
    _handle_dropping_api_version_update(global_config)
    expected_schema_version = "0.0.3"
    assert expected_schema_version == global_config.schema_version
    assert "apiVersion" not in global_config.meta


def test_migrate_old_dashboard(tmp_path, caplog):
    tmp_file_gc = tmp_path / "globalConfig.json"
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_old_dashboard.json"
    )

    with open(global_config_path) as file:
        data = file.read()

    with open(tmp_file_gc, "w+") as file:
        file.write(data)

    global_config = global_config_lib.GlobalConfig(str(tmp_file_gc), False)
    _handle_xml_dashboard_update(global_config)

    expected_schema_version = "0.0.5"
    expected_panel = json.loads('{"panels": [{"name": "default"}]}')
    expected_info = (
        """deprecated dashboard panels found: ['addon_version', 'events_ingested_by_sourcetype', \
'errors_in_the_addon']. Instead, use just one panel: "'name': 'default'"""
        ""
    )

    assert expected_schema_version == global_config.schema_version
    assert expected_panel == global_config.dashboard
    assert expected_info in caplog.text
