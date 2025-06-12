from pytest import fixture
from unittest.mock import MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import AppConf
from textwrap import dedent
from splunk_add_on_ucc_framework import __file__ as ucc_framework_file
import os.path
from time import time

UCC_DIR = os.path.dirname(ucc_framework_file)


@fixture
def addon_version():
    return "1.0.0"


@fixture
def has_ui():
    return True


@fixture
def has_ui_no_globalConfig():
    return False


@fixture
def app_manifest():
    mock_manifest = MagicMock()
    mock_manifest.get_description.return_value = "Test Description"
    mock_manifest.get_authors.return_value = [{"name": "Test Author"}]
    mock_manifest.get_title.return_value = "Test Addon"
    return mock_manifest


def test_set_attributes_check_for_updates_false(
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    addon_version,
    has_ui,
    app_manifest,
):
    """Test _set_attributes when _global_config has checkForUpdates set to False."""
    app_conf = AppConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
        addon_version=addon_version,
        has_ui=has_ui,
        app_manifest=app_manifest,
    )
    app_conf._global_config = MagicMock()
    app_conf._global_config.meta = {"checkForUpdates": False}

    app_conf._set_attributes(
        addon_version=addon_version, has_ui=has_ui, app_manifest=app_manifest
    )

    assert app_conf.check_for_updates == "false"


def test_set_attributes_supported_themes(
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    addon_version,
    has_ui,
    app_manifest,
):
    """Test _set_attributes when _global_config has supportedThemes."""
    app_conf = AppConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
        addon_version=addon_version,
        has_ui=has_ui,
        app_manifest=app_manifest,
    )
    app_conf._global_config = MagicMock()
    app_conf._global_config.meta = {"supportedThemes": ["dark", "light"]}

    app_conf._set_attributes(
        addon_version=addon_version, has_ui=has_ui, app_manifest=app_manifest
    )

    assert app_conf.supported_themes == "dark, light"


def test_set_attributes_with_global_config_and_schema(
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    addon_version,
    has_ui,
    app_manifest,
):
    """Test _set_attributes when _global_config and _gc_schema provide config file names."""
    app_conf = AppConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
        addon_version=addon_version,
        has_ui=has_ui,
        app_manifest=app_manifest,
    )
    app_conf._global_config = MagicMock()
    app_conf._gc_schema = MagicMock()

    app_conf._gc_schema.settings_conf_file_names = ["settings1.conf"]
    app_conf._gc_schema.configs_conf_file_names = ["configs1.conf"]
    app_conf._gc_schema.oauth_conf_file_names = ["oauth1.conf"]

    app_conf._set_attributes(
        addon_version=addon_version, has_ui=has_ui, app_manifest=app_manifest
    )

    expected_custom_conf = ["settings1.conf", "configs1.conf", "oauth1.conf"]
    assert app_conf.custom_conf == expected_custom_conf


def test_generate_conf(
    global_config_all_json,
    input_dir,
    output_dir,
    ta_name,
    addon_version,
    has_ui,
    app_manifest,
):
    exp_fname = "app.conf"

    app_conf = AppConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=UCC_DIR,
        addon_name=ta_name,
        addon_version=addon_version,
        has_ui=has_ui,
        app_manifest=app_manifest,
    )
    output = app_conf.generate()
    # Build is calculated dynamically, we can't pass static value.
    build = str(int(time()))
    expected_content = dedent(
        f"""
        [launcher]
        version = 1.0.0
        description = Test Description
        author = Test Author

        [id]
        version = 1.0.0
        name = test_addon

        [install]
        build = {build}
        is_configured = false
        state = enabled

        [package]
        id = test_addon
        check_for_updates = true

        [ui]
        label = Test Addon
        is_visible = true

        [triggers]
        reload.splunk_ta_uccexample_settings = simple
        reload.splunk_ta_uccexample_account = simple
        reload.splunk_ta_uccexample_oauth = simple
        """
    ).lstrip()
    assert output == [
        {
            "file_name": exp_fname,
            "file_path": f"{output_dir}/{ta_name}/default/{exp_fname}",
            "content": expected_content,
            "merge_mode": "item_overwrite",
        }
    ]
