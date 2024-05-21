import json

import pytest

import tests.unit.helpers as helpers
from splunk_add_on_ucc_framework.global_config_update import (
    _handle_biased_terms_update,
    _handle_dropping_api_version_update,
    _handle_xml_dashboard_update,
    _handle_alert_action_updates,
    _dump_with_migrated_tabs,
    _dump_with_migrated_entities,
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


def test_handle_alert_action_updates(tmp_path, caplog):
    tmp_file_gc = tmp_path / "globalConfig.json"
    # a new globalConfig with minimal configs for input and configuration
    helpers.copy_testdata_gc_to_tmp_file(tmp_file_gc, "valid_config_all_alerts.json")
    global_config = global_config_lib.GlobalConfig(str(tmp_file_gc), False)

    _handle_alert_action_updates(global_config)

    expected_schema_version = "0.0.4"
    assert expected_schema_version == global_config.schema_version
    expected_text = (
        "'activeResponse' is deprecated. Please use 'adaptiveResponse' instead."
    )

    for log_tuple in caplog.record_tuples:
        assert log_tuple[1] == 30  # 'WARNING' log's numeric value is 30
        assert log_tuple[2] == expected_text

    for alert in global_config.alerts:
        assert alert.get("adaptiveResponse")
        assert alert.get("activeResponse") is None
        if alert["name"] == "test_alert_default":
            # check the default values when these properties aren't provided in an alert
            assert alert["adaptiveResponse"]["supportsAdhoc"] is False
            assert alert["adaptiveResponse"]["supportsCloud"] is True
        assert alert.get("adaptiveResponse", {}).get("supportsAdhoc") is not None
        assert alert.get("adaptiveResponse", {}).get("supportsCloud") is not None


def test_migrate_old_dashboard(tmp_path, caplog):
    tmp_file_gc = tmp_path / "globalConfig.json"
    helpers.copy_testdata_gc_to_tmp_file(tmp_file_gc, "valid_config_old_dashboard.json")

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


def test_tab_migration(tmp_path):
    tmp_file_gc = tmp_path / "globalConfig.json"
    helpers.copy_testdata_gc_to_tmp_file(tmp_file_gc, "valid_config_only_logging.json")
    assert "loggingTab" not in tmp_file_gc.read_text()

    global_config = global_config_lib.GlobalConfig(str(tmp_file_gc), False)
    _dump_with_migrated_tabs(global_config, global_config.original_path)

    assert "loggingTab" in tmp_file_gc.read_text()

    gc_json = json.loads(tmp_file_gc.read_text())

    for tab in gc_json["pages"]["configuration"]["tabs"]:
        if tab == {"type": "loggingTab"}:
            break
    else:
        assert False, "No tab found"


def test_entity_migration(tmp_path):
    tmp_file_gc = tmp_path / "globalConfig.json"
    helpers.copy_testdata_gc_to_tmp_file(
        tmp_file_gc, "valid_config_only_interval_migration.json"
    )
    assert '"type": "interval"' not in tmp_file_gc.read_text()

    global_config = global_config_lib.GlobalConfig(str(tmp_file_gc), False)
    _dump_with_migrated_entities(global_config, global_config.original_path)

    assert '"type": "interval"' in tmp_file_gc.read_text()

    gc_json = json.loads(tmp_file_gc.read_text())

    input_entity = gc_json["pages"]["inputs"]["services"][0]["entity"][0]
    config_entity = gc_json["pages"]["configuration"]["tabs"][0]["entity"][0]
    alerts_entity = gc_json["alerts"][0]["entity"][0]

    assert (
        input_entity
        == config_entity
        == alerts_entity
        == {
            "type": "interval",
            "field": "interval",
            "label": "Interval",
            "defaultValue": 15,
            "help": "Some help",
            "tooltip": "Some tooltip",
            "required": True,
            "options": {
                "range": [10, 20],
            },
        }
    )
