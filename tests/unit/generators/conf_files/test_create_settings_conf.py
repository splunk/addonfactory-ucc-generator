from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import SettingsConf
import os.path
from splunk_add_on_ucc_framework import __file__ as ucc_framework_file

UCC_DIR = os.path.dirname(ucc_framework_file)
TA_NAME = "splunk_ta_uccexample"


def test_set_attributes(global_config_only_logging, input_dir, output_dir, ucc_dir):
    settings_conf = SettingsConf(
        global_config_only_logging,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=TA_NAME,
    )
    assert (
        settings_conf.conf_file
        == f"{global_config_only_logging.namespace.lower()}_settings.conf"
    )
    assert (
        settings_conf.conf_file
        == f"{global_config_only_logging.namespace.lower()}_settings.conf"
    )
    assert (
        settings_conf.conf_spec_file
        == f"{global_config_only_logging.namespace.lower()}_settings.conf.spec"
    )
    assert settings_conf.settings_stanzas == [("logging", ["loglevel = "])]
    assert settings_conf.default_content == "[logging]\nloglevel = INFO"


def test_set_attribute_for_conf_only_TA(
    global_config_for_conf_only_TA, input_dir, output_dir, ucc_dir, ta_name
):
    settings_conf = SettingsConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    settings_conf._set_attributes()
    assert settings_conf.settings_stanzas == []
    assert settings_conf.default_content == ""


def test_set_attributes_no_settings_key(
    global_config_for_alerts, input_dir, output_dir, ucc_dir
):
    settings_conf = SettingsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=TA_NAME,
    )
    assert settings_conf.default_content == ""


def test_generate_conf(global_config_all_json, input_dir, output_dir):
    exp_fname = f"{TA_NAME}_settings.conf"

    settings_conf = SettingsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=UCC_DIR,
        addon_name=TA_NAME,
    )
    output = settings_conf.generate_conf()
    expected_content = (
        "\n".join(
            [
                "[proxy]",
                "proxy_enabled = ",
                "proxy_type = http",
                "proxy_url = ",
                "proxy_port = ",
                "proxy_username = ",
                "proxy_password = ",
                "proxy_rdns = ",
                "",
                "[logging]",
                "loglevel = INFO",
                "",
                "[custom_abc]",
                "testString = ",
                "testNumber = ",
                "testRegex = ",
                "testEmail = ",
                "testIpv4 = ",
                "testDate = ",
                "testUrl = ",
            ]
        )
        + "\n"
    )

    assert output == {
        "file_name": exp_fname,
        "file_path": f"{output_dir}/{TA_NAME}/default/{exp_fname}",
        "content": expected_content,
    }


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.SettingsConf._set_attributes",
    return_value=MagicMock(),
)
def test_generate_conf_no_default_content(
    global_config, input_dir, output_dir, ucc_dir, ta_name
):
    settings_conf = SettingsConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    settings_conf.default_content = ""
    result = settings_conf.generate_conf()
    result is None


def test_generate_conf_spec(global_config_all_json, input_dir, output_dir):
    exp_fname = f"{TA_NAME}_settings.conf.spec"

    settings_conf = SettingsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=UCC_DIR,
        addon_name=TA_NAME,
    )
    expected_content = (
        "\n".join(
            [
                "[proxy]",
                "proxy_enabled = ",
                "proxy_password = ",
                "proxy_port = ",
                "proxy_rdns = ",
                "proxy_type = ",
                "proxy_url = ",
                "proxy_username = ",
                "[logging]",
                "loglevel = ",
                "[custom_abc]",
                "testDate = ",
                "testEmail = ",
                "testIpv4 = ",
                "testNumber = ",
                "testRegex = ",
                "testString = ",
                "testUrl = ",
            ]
        )
        + "\n"
    )

    output = settings_conf.generate_conf_spec()
    assert output == {
        "file_name": exp_fname,
        "file_path": f"{output_dir}/{TA_NAME}/README/{exp_fname}",
        "content": expected_content,
    }


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.SettingsConf._set_attributes",
    return_value=MagicMock(),
)
def test_generate_conf_no_settings_stanzas(
    global_config, input_dir, output_dir, ucc_dir, ta_name
):
    settings_conf = SettingsConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    settings_conf.settings_stanzas = []
    result = settings_conf.generate_conf_spec()
    result is None
