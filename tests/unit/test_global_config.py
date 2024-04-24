import json
import os.path

import pytest
from unittest import mock

import tests.unit.helpers as helpers

from splunk_add_on_ucc_framework import global_config as global_config_lib
from splunk_add_on_ucc_framework.global_config_update import _dump_with_migrated_tabs


@pytest.mark.parametrize(
    "filename,is_yaml",
    [
        ("valid_config.json", False),
        ("valid_config.yaml", True),
    ],
)
def test_global_config_parse(filename, is_yaml):
    global_config_path = helpers.get_testdata_file_path(filename)
    global_config = global_config_lib.GlobalConfig(global_config_path, is_yaml)

    assert global_config.namespace == "splunk_ta_uccexample"
    assert global_config.product == "Splunk_TA_UCCExample"
    assert global_config.display_name == "Splunk UCC test Add-on"
    assert global_config.original_path == global_config_path
    assert global_config.schema_version == "0.0.3"
    assert global_config.version == "1.0.0"
    assert global_config.has_inputs() is True
    assert global_config.has_alerts() is True
    assert global_config.has_oauth() is True
    assert global_config.has_dashboard() is True


@mock.patch("splunk_add_on_ucc_framework.utils.dump_json_config")
def test_global_config_dump_when_json(
    mock_utils_dump_json_config, global_config_all_json, tmp_path
):
    global_config_all_json.dump(str(tmp_path))

    mock_utils_dump_json_config.assert_called_once()


@mock.patch("splunk_add_on_ucc_framework.utils.dump_yaml_config")
def test_global_config_dump_when_yaml(
    mock_utils_dump_yaml_config, global_config_all_yaml, tmp_path
):
    global_config_all_yaml.dump(str(tmp_path))

    mock_utils_dump_yaml_config.assert_called_once()


def test_global_config_settings(global_config_only_configuration):
    settings = global_config_only_configuration.settings
    expected_settings_names = ["proxy", "logging", "custom_abc"]
    settings_names = [setting["name"] for setting in settings]
    assert expected_settings_names == settings_names


def test_global_config_configs(global_config_only_configuration):
    configs = global_config_only_configuration.configs
    expected_configs_names = ["account"]
    configs_names = [config["name"] for config in configs]
    assert expected_configs_names == configs_names


def test_global_config_only_configuration(global_config_only_configuration):
    assert global_config_only_configuration.has_inputs() is False
    assert global_config_only_configuration.has_alerts() is False
    assert global_config_only_configuration.has_oauth() is False
    assert global_config_only_configuration.has_dashboard() is False


def test_global_config_only_logging(global_config_only_logging):
    assert global_config_only_logging.has_alerts() is False


def test_global_config_update_addon_version(global_config_only_configuration):
    global_config_only_configuration.update_addon_version("1.1.1")

    assert global_config_only_configuration.version == "1.1.1"


@pytest.mark.parametrize("migration", [True, False])
def test_global_config_logging_component(migration, tmp_path):
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_only_logging.json"
    )
    with open(global_config_path) as fp:
        global_config_content = json.load(fp)

    long_tabs = global_config_content["pages"]["configuration"]["tabs"]
    short_tabs = [{"type": "loggingTab"}]

    if not migration:
        global_config_content["pages"]["configuration"]["tabs"] = short_tabs

    global_config = global_config_lib.GlobalConfig(global_config_path, False)

    render_true = os.path.join(tmp_path, "render_true.json")
    render_false = os.path.join(tmp_path, "render_false.json")

    _dump_with_migrated_tabs(global_config, render_false)
    with open(render_false) as fp:
        render_false_dict = json.load(fp)

    global_config.expand_tabs()
    global_config.dump(render_true)
    with open(render_true) as fp:
        render_true_dict = json.load(fp)

    assert render_true_dict["pages"]["configuration"]["tabs"] == long_tabs

    tabs = render_false_dict["pages"]["configuration"]["tabs"]
    assert tabs == short_tabs
