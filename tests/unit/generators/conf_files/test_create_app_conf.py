from splunk_add_on_ucc_framework.generators.conf_files import AppConf
from textwrap import dedent
from tests.unit.helpers import get_testdata_file_path
import os
from time import time

INPUT_DIR = os.path.join(get_testdata_file_path("app.manifest"), os.pardir)


def test_init_check_for_updates_false(
    global_config_all_json,
    output_dir,
):
    """Test __init__ when _global_config has checkForUpdates set to False."""
    global_config_all_json.meta.update({"checkForUpdates": False})

    app_conf = AppConf(global_config_all_json, INPUT_DIR, output_dir)

    assert app_conf.check_for_updates == "false"


def test_init_supported_themes(global_config_all_json, output_dir):
    """Test __init__ when _global_config has supportedThemes."""
    global_config_all_json.meta.update({"supportedThemes": ["dark", "light"]})
    app_conf = AppConf(global_config_all_json, INPUT_DIR, output_dir)

    assert app_conf.supported_themes == "dark, light"


def test_init_with_global_config_and_schema(
    global_config_all_json,
    output_dir,
):
    """Test __init__ when _global_config and _gc_schema provide config file names."""
    expected_custom_conf = [
        "splunk_ta_uccexample_settings",
        "splunk_ta_uccexample_account",
        "splunk_ta_uccexample_oauth",
    ]

    app_conf = AppConf(global_config_all_json, INPUT_DIR, output_dir)

    assert app_conf.custom_conf == expected_custom_conf


def test_generate_conf(
    global_config_all_json,
    output_dir,
):
    exp_fname = "app.conf"
    ta_name = global_config_all_json.product

    app_conf = AppConf(global_config_all_json, INPUT_DIR, output_dir)
    output = app_conf.generate()
    # Build is calculated dynamically, we can't pass static value.
    build = str(int(time()))
    expected_content = dedent(
        f"""
        [launcher]
        version = 1.0.0
        description = Description of Splunk Add-on for UCC Example
        author = Splunk

        [id]
        version = 1.0.0
        name = Splunk_TA_UCCExample

        [install]
        build = {build}
        is_configured = false
        state = enabled

        [package]
        id = Splunk_TA_UCCExample
        check_for_updates = true

        [ui]
        label = Splunk Add-on for UCC Example
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
