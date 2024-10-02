from pytest import fixture
from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import SettingsConf
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from tests.unit.helpers import get_testdata_file_path

TA_NAME = "test_addon"


@fixture
def global_config():
    gc = GlobalConfig(get_testdata_file_path("valid_config.json"))
    gc._content["meta"]["restRoot"] = TA_NAME
    return gc


@fixture
def input_dir(tmp_path):
    return str(tmp_path / "input_dir")


@fixture
def output_dir(tmp_path):
    return str(tmp_path / "output_dir")


@fixture
def ucc_dir(tmp_path):
    return str(tmp_path / "ucc_dir")


@fixture
def ta_name():
    return TA_NAME


def test_set_attributes(global_config, input_dir, output_dir, ucc_dir, ta_name):
    settings_conf = SettingsConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    settings_conf._global_config = MagicMock()
    settings_conf._gc_schema = MagicMock()

    settings_conf._global_config.settings = [{"entity": "entity1", "name": "setting1"}]
    settings_conf._global_config.namespace = TA_NAME
    settings_conf._gc_schema._get_oauth_enitities.return_value = "mocked_content"
    settings_conf._gc_schema._parse_fields.return_value = [MagicMock(_name="field1")]

    settings_conf._gc_schema._endpoints = {"settings": MagicMock()}
    settings_conf._gc_schema._endpoints[
        "settings"
    ].generate_conf_with_default_values.return_value = "default_values"

    settings_conf._set_attributes()

    assert settings_conf.conf_file == f"{global_config.namespace.lower()}_settings.conf"
    assert (
        settings_conf.conf_spec_file
        == f"{global_config.namespace.lower()}_settings.conf.spec"
    )
    assert settings_conf.settings_stanzas == [("setting1", ["field1 = "])]
    assert settings_conf.default_content == "default_values"


def test_set_attribute_gc_only(global_config, input_dir, output_dir, ucc_dir, ta_name):
    settings_conf = SettingsConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    settings_conf._global_config = MagicMock()
    settings_conf._gc_schema = None

    settings_conf._set_attributes()
    assert settings_conf.conf_file == f"{ta_name}_settings.conf"
    assert settings_conf.conf_spec_file == f"{ta_name}_settings.conf.spec"
    assert settings_conf.settings_stanzas == []
    assert settings_conf.default_content == ""


def test_set_attribute_gc_schema_only(
    global_config, input_dir, output_dir, ucc_dir, ta_name
):
    settings_conf = SettingsConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    settings_conf._gc_schema = MagicMock()
    settings_conf._global_config = None

    settings_conf._set_attributes()
    assert settings_conf.conf_file == f"{ta_name}_settings.conf"
    assert settings_conf.conf_spec_file == f"{ta_name}_settings.conf.spec"
    assert settings_conf.settings_stanzas == []
    assert settings_conf.default_content == ""


def test_set_attributes_no_settings_key(
    global_config, input_dir, output_dir, ucc_dir, ta_name
):
    settings_conf = SettingsConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    settings_conf._addon_name = "TestAddon"
    settings_conf._global_config = MagicMock()
    settings_conf._gc_schema = MagicMock()

    settings_conf._global_config.settings = [{"entity": "entity1", "name": "setting1"}]
    settings_conf._gc_schema._get_oauth_enitities.return_value = "mocked_content"
    settings_conf._gc_schema._parse_fields.return_value = [MagicMock(_name="field1")]

    settings_conf._gc_schema._endpoints = {}

    settings_conf._set_attributes()

    assert settings_conf.settings_stanzas == [("setting1", ["field1 = "])]
    assert settings_conf.default_content == ""


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.SettingsConf.set_template_and_render"
)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.SettingsConf.get_file_output_path"
)
def test_generate_conf(
    mock_op_path, mock_template, global_config, input_dir, output_dir, ucc_dir, ta_name
):
    content = "content"
    exp_fname = f"{ta_name}_settings.conf"
    file_path = f"output_path/{exp_fname}"
    mock_op_path.return_value = file_path
    template_render = MagicMock()
    template_render.render.return_value = content

    settings_conf = SettingsConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    settings_conf.writer = MagicMock()
    settings_conf._template = template_render
    file_paths = settings_conf.generate_conf()

    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1
    settings_conf.writer.assert_called_once_with(
        file_name=exp_fname,
        file_path=file_path,
        content=content,
    )
    assert file_paths == {exp_fname: file_path}


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


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.SettingsConf.set_template_and_render"
)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.SettingsConf.get_file_output_path"
)
def test_generate_conf_spec(
    mock_op_path, mock_template, global_config, input_dir, output_dir, ucc_dir, ta_name
):
    content = "content"
    exp_fname = f"{ta_name}_settings.conf.spec"
    file_path = f"output_path/{exp_fname}"
    mock_op_path.return_value = file_path
    mock_template_render = MagicMock()
    mock_template_render.render.return_value = content

    settings_conf = SettingsConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    settings_conf.writer = MagicMock()
    settings_conf._template = mock_template_render

    file_paths = settings_conf.generate_conf_spec()

    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1
    settings_conf.writer.assert_called_once_with(
        file_name=exp_fname,
        file_path=file_path,
        content=content,
    )
    assert file_paths == {exp_fname: file_path}


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
