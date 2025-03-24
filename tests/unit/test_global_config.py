import itertools
import json
import os.path
from typing import Any, Iterator

import pytest
from unittest import mock

import tests.unit.helpers as helpers

from splunk_add_on_ucc_framework import global_config as global_config_lib


@mock.patch(
    "splunk_add_on_ucc_framework.global_config.GlobalConfig.from_app_conf_and_app_manifest",
    return_value="tmp_path",
)
def test_globalconfig_init_with_empty_path(
    mock_function, tmp_path, mock_app_manifest, mock_app_conf_content
):
    """Test GlobalConfig initialization when global_config_path is empty."""

    source_dir = str(tmp_path / "source")

    global_config_lib.GlobalConfig(
        global_config_path="",
        source=source_dir,
        app_manifest=mock_app_manifest,
        app_conf_content=mock_app_conf_content,
    )

    mock_function.assert_called_once_with(
        source_dir, mock_app_manifest, mock_app_conf_content
    )


@pytest.mark.parametrize(
    "check_for_updates, expected_check_for_updates",
    [
        ("true", True),
        ("false", False),
        ("1", True),
        ("0", False),
        ("yes", True),
        ("no", False),
        ("t", True),
        ("f", False),
    ],
)
@pytest.mark.parametrize(
    "supported_themes, expected_supported_themes",
    [
        ("light, dark", ["light", "dark"]),
        ("light", ["light"]),
        ("", []),  # Empty case
        (None, []),  # None case
    ],
)
@mock.patch("splunk_add_on_ucc_framework.global_config.utils.write_file")
def test_from_app_conf_and_app_manifest(
    mock_write_file,
    check_for_updates,
    expected_check_for_updates,
    supported_themes,
    expected_supported_themes,
    tmp_path,
):
    mock_app_manifest = mock.MagicMock()
    mock_app_manifest.get_addon_name.return_value = "test_addon"
    mock_app_manifest.get_title.return_value = "Test Addon"
    mock_app_manifest.get_addon_version.return_value = "1.0.0"

    mock_app_conf_content = {
        "package": {"check_for_updates": check_for_updates},
        "ui": {"supported_themes": supported_themes},
    }

    source_dir = str(tmp_path / "source")
    os.makedirs(source_dir, exist_ok=True)

    # Creating the instance automatically calls `from_app_conf_and_app_manifest`
    global_config_lib.GlobalConfig(
        global_config_path="",
        source=source_dir,
        app_manifest=mock_app_manifest,
        app_conf_content=mock_app_conf_content,
    )

    expected_path = os.path.join(source_dir, os.pardir, "globalConfig.json")

    # Verify the function was called **once** during instantiation
    assert mock_write_file.call_count == 1

    # Verify the correct JSON content is written
    expected_content = {
        "meta": {
            "name": "test_addon",
            "restRoot": "test_addon",
            "displayName": "Test Addon",
            "version": "1.0.0",
            "checkForUpdates": expected_check_for_updates,
        }
    }

    if expected_supported_themes:
        expected_content["meta"]["supportedThemes"] = expected_supported_themes

    # Ensure `write_file` was called with correct content
    mock_write_file.assert_called_with(
        file_name="globalConfig.json",
        file_path=expected_path,
        content=json.dumps(expected_content, indent=4),
    )


@pytest.mark.parametrize(
    "filename",
    [
        "valid_config.json",
        "valid_config.yaml",
    ],
)
def test_global_config_parse(filename):
    global_config_path = helpers.get_testdata_file_path(filename)
    global_config = global_config_lib.GlobalConfig(global_config_path)

    assert global_config.namespace == "splunk_ta_uccexample"
    assert global_config.product == "Splunk_TA_UCCExample"
    assert global_config.display_name == "Splunk UCC test Add-on"
    assert global_config.original_path == global_config_path
    assert global_config.schema_version == "0.0.3"
    assert global_config.version == "1.0.0"
    assert global_config.has_pages() is True
    assert global_config.has_inputs() is True
    assert global_config.has_configuration() is True
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
    assert global_config_only_configuration.has_configuration() is True
    assert global_config_only_configuration.has_inputs() is False
    assert global_config_only_configuration.has_alerts() is False
    assert global_config_only_configuration.has_oauth() is False
    assert global_config_only_configuration.has_dashboard() is False


def test_global_config_no_configuration(global_config_no_configuration):
    assert global_config_no_configuration.has_configuration() is False
    assert global_config_no_configuration.has_inputs() is True
    assert global_config_no_configuration.has_alerts() is False
    assert global_config_no_configuration.has_oauth() is False
    assert global_config_no_configuration.has_dashboard() is True


def test_global_config_only_logging(global_config_only_logging):
    assert global_config_only_logging.has_alerts() is False


def test_global_config_for_conf_only_TA(global_config_for_conf_only_TA):
    assert global_config_for_conf_only_TA.has_pages() is False
    assert hasattr(global_config_for_conf_only_TA, "meta")


def test_global_config_update_addon_version(global_config_only_configuration):
    global_config_only_configuration.update_addon_version("1.1.1")

    assert global_config_only_configuration.version == "1.1.1"


def test_global_config_expand(tmp_path):
    global_config_path = helpers.get_testdata_file_path("valid_config_expand.json")

    global_config = global_config_lib.GlobalConfig(global_config_path)

    assert {"type": "loggingTab"} in global_config.configuration
    assert count_tabs(global_config, name="logging") == 0
    assert count_entities(global_config, type="interval") == 3
    assert count_entities(global_config, type="text", field="interval") == 0

    global_config.expand()

    assert {"type": "loggingTab"} not in global_config.configuration
    assert count_tabs(global_config, name="logging") == 1
    assert count_entities(global_config, type="interval") == 0
    assert count_entities(global_config, type="text", field="interval") == 3


def test_global_config_cleanup_unwanted_params(global_config_only_logging, tmp_path):
    global_config_path = helpers.get_testdata_file_path("valid_config.json")

    with open(global_config_path) as fp:
        content = json.load(fp)

    content["meta"]["_uccVersion"] = "1.0.0"

    new_path = os.path.join(tmp_path, "config.json")

    with open(new_path, "w") as fp:
        json.dump(content, fp)

    global_config = global_config_lib.GlobalConfig(new_path)

    assert global_config.content["meta"].get("_uccVersion") == "1.0.0"

    global_config.cleanup_unwanted_params()

    assert "_uccVersion" not in global_config.content["meta"]


def test_global_config_add_ucc_version(global_config_only_logging, tmp_path):
    global_config_path = helpers.get_testdata_file_path("valid_config.json")
    global_config = global_config_lib.GlobalConfig(global_config_path)

    assert "_uccVersion" not in global_config.content["meta"]
    global_config.add_ucc_version("1.0.0")
    assert (
        global_config.content["meta"].get("_uccVersion")
        == global_config.ucc_version
        == "1.0.0"
    )


def all_entities(gc: global_config_lib.GlobalConfig) -> Iterator[Any]:
    objects = itertools.chain(gc.configuration, gc.alerts, gc.inputs)
    return itertools.chain(*(obj["entity"] for obj in objects if "entity" in obj))


def count_entities(gc: global_config_lib.GlobalConfig, **kwargs: str) -> int:
    return sum(
        1
        for entity in all_entities(gc)
        if all(entity.get(k, "") == v for k, v in kwargs.items())
    )


def count_tabs(gc: global_config_lib.GlobalConfig, **kwargs: str) -> int:
    return sum(
        1
        for tab in gc.configuration
        if all(tab.get(k, "") == v for k, v in kwargs.items())
    )
