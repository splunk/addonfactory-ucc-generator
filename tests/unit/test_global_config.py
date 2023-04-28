import pytest
from unittest import mock

import tests.unit.helpers as helpers

from splunk_add_on_ucc_framework import global_config as global_config_lib


@pytest.mark.parametrize(
    "filename,is_yaml",
    [
        ("valid_config.json", False),
        ("valid_config.yaml", True),
    ],
)
def test_global_config_parse(filename, is_yaml):
    global_config_path = helpers.get_testdata_file_path(filename)
    global_config = global_config_lib.GlobalConfig()
    global_config.parse(global_config_path, is_yaml)

    assert global_config.namespace == "splunk_ta_uccexample"
    assert global_config.product == "Splunk_TA_UCCExample"
    assert global_config.display_name == "Splunk UCC test Add-on"
    assert global_config.original_path == global_config_path
    assert global_config.schema_version == "0.0.3"
    assert global_config.version == "1.0.0"
    assert global_config.has_inputs() is True
    assert global_config.has_alerts() is True
    assert global_config.has_dashboard() is True


@mock.patch("splunk_add_on_ucc_framework.utils.dump_json_config")
def test_global_config_dump_when_json(mock_utils_dump_json_config, tmp_path):
    global_config_path = helpers.get_testdata_file_path("valid_config.json")
    global_config = global_config_lib.GlobalConfig()
    global_config.parse(global_config_path, False)

    global_config.dump(str(tmp_path))

    mock_utils_dump_json_config.assert_called_once()


@mock.patch("splunk_add_on_ucc_framework.utils.dump_yaml_config")
def test_global_config_dump_when_yaml(mock_utils_dump_yaml_config, tmp_path):
    global_config_path = helpers.get_testdata_file_path("valid_config.yaml")
    global_config = global_config_lib.GlobalConfig()
    global_config.parse(global_config_path, True)

    global_config.dump(str(tmp_path))

    mock_utils_dump_yaml_config.assert_called_once()


def test_global_config_has_():
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_only_configuration.json"
    )
    global_config = global_config_lib.GlobalConfig()
    global_config.parse(global_config_path, False)

    assert global_config.has_dashboard() is False


def test_global_config_settings():
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_only_configuration.json"
    )
    global_config = global_config_lib.GlobalConfig()
    global_config.parse(global_config_path, False)

    settings = global_config.settings
    expected_settings_names = ["proxy", "logging", "custom_abc"]
    settings_names = [setting["name"] for setting in settings]
    assert expected_settings_names == settings_names


def test_global_config_configs():
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_only_configuration.json"
    )
    global_config = global_config_lib.GlobalConfig()
    global_config.parse(global_config_path, False)

    configs = global_config.configs
    expected_configs_names = ["account"]
    configs_names = [config["name"] for config in configs]
    assert expected_configs_names == configs_names


def test_global_config_only_configuration():
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_only_configuration.json"
    )
    global_config = global_config_lib.GlobalConfig()
    global_config.parse(global_config_path, False)

    assert global_config.has_inputs() is False
    assert global_config.has_alerts() is False


def test_global_config_update_addon_version():
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_only_configuration.json"
    )
    global_config = global_config_lib.GlobalConfig()
    global_config.parse(global_config_path, False)

    global_config.update_addon_version("1.1.1")

    assert global_config.version == "1.1.1"
