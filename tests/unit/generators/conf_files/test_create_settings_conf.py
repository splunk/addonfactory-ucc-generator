from pytest import fixture
from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import SettingsConf
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from tests.unit.helpers import get_testdata_file_path

TA_NAME = "test_addon"


@fixture
def global_config():
    gc = GlobalConfig.from_file(get_testdata_file_path("valid_config.json"))
    gc._content["meta"]["restRoot"] = TA_NAME
    return gc


def test_set_attributes(
    global_config_only_logging, input_dir, output_dir, ucc_dir, ta_name
):
    settings_conf = SettingsConf(
        global_config_only_logging,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
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
    assert settings_conf.settings_stanzas == []
    assert settings_conf.default_content == ""


def test_set_attributes_no_settings_key(
    global_config_for_alerts, input_dir, output_dir, ucc_dir, ta_name
):
    settings_conf = SettingsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert settings_conf.default_content == ""


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.SettingsConf.set_template_and_render"
)
def test_generate_conf(
    mock_template, global_config, input_dir, output_dir, ucc_dir, ta_name
):
    content = "content"
    exp_fname = f"{ta_name}_settings.conf"
    template_render = MagicMock()
    template_render.render.return_value = content

    settings_conf = SettingsConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    settings_conf._template = template_render
    file_paths = settings_conf.generate_conf()

    assert mock_template.call_count == 1
    assert file_paths == {exp_fname: f"{output_dir}/{TA_NAME}/default/{exp_fname}"}


def test_generate_conf_no_default_content(
    global_config_for_conf_only_TA, input_dir, output_dir, ucc_dir, ta_name
):
    settings_conf = SettingsConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    result = settings_conf.generate_conf()
    result is None


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.SettingsConf.set_template_and_render"
)
def test_generate_conf_spec(
    mock_template, global_config, input_dir, output_dir, ucc_dir, ta_name
):
    content = "content"
    exp_fname = f"{ta_name}_settings.conf.spec"
    mock_template_render = MagicMock()
    mock_template_render.render.return_value = content

    settings_conf = SettingsConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    settings_conf._template = mock_template_render

    file_paths = settings_conf.generate_conf_spec()

    assert mock_template.call_count == 1
    assert file_paths == {exp_fname: f"{output_dir}/{TA_NAME}/README/{exp_fname}"}


def test_generate_conf_no_settings_stanzas(
    global_config_for_conf_only_TA, input_dir, output_dir, ucc_dir, ta_name
):
    settings_conf = SettingsConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    settings_conf.settings_stanzas = []
    result = settings_conf.generate_conf_spec()
    result is None
