from splunk_add_on_ucc_framework.generators.conf_files import SettingsConf
import os.path
from textwrap import dedent
from splunk_add_on_ucc_framework import __file__ as ucc_framework_file

UCC_DIR = os.path.dirname(ucc_framework_file)
TA_NAME = "splunk_ta_uccexample"


# Strips the trailing whitespaces and and compare content per line
def normalize(s):
    return "\n".join(line.rstrip() for line in s.strip().splitlines())


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
    global_config_for_conf_only_TA, input_dir, output_dir, ucc_dir
):
    settings_conf = SettingsConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=TA_NAME,
    )
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
    file_paths = settings_conf.generate_conf()
    expected_content = dedent(
        """
        [proxy]
        proxy_enabled =
        proxy_type = http
        proxy_url =
        proxy_port =
        proxy_username =
        proxy_password =
        proxy_rdns =

        [logging]
        loglevel = INFO

        [custom_abc]
        testString =
        testNumber =
        testRegex =
        testEmail =
        testIpv4 =
        testDate =
        testUrl =
        """
    )
    with open(file_paths[f"{TA_NAME}_settings.conf"]) as fp:
        content = fp.read()
    assert file_paths == {exp_fname: f"{output_dir}/{TA_NAME}/default/{exp_fname}"}
    assert normalize(expected_content) == normalize(content)


def test_generate_conf_no_default_content(
    global_config_for_conf_only_TA, input_dir, output_dir, ucc_dir
):
    settings_conf = SettingsConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=TA_NAME,
    )
    result = settings_conf.generate_conf()
    result == {"": ""}


def test_generate_conf_spec(global_config_all_json, input_dir, output_dir):
    exp_fname = f"{TA_NAME}_settings.conf.spec"

    settings_conf = SettingsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=UCC_DIR,
        addon_name=TA_NAME,
    )
    expected_content = dedent(
        """
        [proxy]
        proxy_enabled =
        proxy_password =
        proxy_port =
        proxy_rdns =
        proxy_type =
        proxy_url =
        proxy_username =

        [logging]
        loglevel =

        [custom_abc]
        testDate =
        testEmail =
        testIpv4 =
        testNumber =
        testRegex =
        testString =
        testUrl =
        """
    )

    file_paths = settings_conf.generate_conf_spec()
    assert file_paths == {exp_fname: f"{output_dir}/{TA_NAME}/README/{exp_fname}"}
    with open(file_paths[f"{TA_NAME}_settings.conf.spec"]) as fp:
        content = fp.read()

    assert normalize(expected_content) == normalize(content)


def test_generate_conf_no_settings_stanzas(
    global_config_for_conf_only_TA, input_dir, output_dir, ucc_dir
):
    settings_conf = SettingsConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=TA_NAME,
    )
    result = settings_conf.generate_conf_spec()
    result == {"": ""}
