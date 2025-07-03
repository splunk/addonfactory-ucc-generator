from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import SettingsConf


def test_set_attributes(global_config_only_logging, input_dir, output_dir):
    settings_conf = SettingsConf(global_config_only_logging, input_dir, output_dir)
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
    global_config_for_conf_only_TA,
    input_dir,
    output_dir,
):
    settings_conf = SettingsConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
    )
    settings_conf._set_attributes()
    assert settings_conf.settings_stanzas == []
    assert settings_conf.default_content == ""


def test_set_attributes_no_settings_key(
    global_config_for_alerts, input_dir, output_dir
):
    settings_conf = SettingsConf(global_config_for_alerts, input_dir, output_dir)
    assert settings_conf.default_content == ""


def test_generate_conf(global_config_all_json, input_dir, output_dir):
    ta_name = global_config_all_json.product
    exp_fname = f"{global_config_all_json.namespace.lower()}_settings.conf"

    settings_conf = SettingsConf(global_config_all_json, input_dir, output_dir)
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
        "file_path": f"{output_dir}/{ta_name}/default/{exp_fname}",
        "content": expected_content,
    }


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.SettingsConf._set_attributes",
    return_value=MagicMock(),
)
def test_generate_conf_no_default_content(
    global_config,
    input_dir,
    output_dir,
):
    settings_conf = SettingsConf(
        global_config,
        input_dir,
        output_dir,
    )
    settings_conf.default_content = ""
    result = settings_conf.generate_conf()
    result is None


def test_generate_conf_spec(global_config_all_json, input_dir, output_dir):
    ta_name = global_config_all_json.product
    exp_fname = f"{global_config_all_json.namespace.lower()}_settings.conf.spec"

    settings_conf = SettingsConf(global_config_all_json, input_dir, output_dir)
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
        "file_path": f"{output_dir}/{ta_name}/README/{exp_fname}",
        "content": expected_content,
    }


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.SettingsConf._set_attributes",
    return_value=MagicMock(),
)
def test_generate_conf_no_settings_stanzas(
    global_config,
    input_dir,
    output_dir,
):
    settings_conf = SettingsConf(
        global_config,
        input_dir,
        output_dir,
    )
    settings_conf.settings_stanzas = []
    result = settings_conf.generate_conf_spec()
    result is None
