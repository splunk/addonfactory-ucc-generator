from pytest import fixture
from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.globalConfig_generator import (
    MinimalGlobalConfig,
)
from tests.unit.helpers import get_testdata_file_path
from splunk_add_on_ucc_framework.global_config import GlobalConfig


@fixture
def valid_global_config():
    return GlobalConfig(get_testdata_file_path("valid_config.json"))


@fixture
def global_config():
    return None


@fixture
def app_manifest():
    mock_manifest = MagicMock()
    mock_manifest.get_addon_name.return_value = "test_addon"
    mock_manifest.get_addon_version.return_value = "1.0.0"
    mock_manifest.get_title.return_value = "Test title"
    return mock_manifest


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
    return "test_addon"


def test_set_attribute_with_global_config(
    valid_global_config,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    app_manifest,
):
    minimal_gc = MinimalGlobalConfig(
        global_config=valid_global_config,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
        app_manifest=app_manifest,
    )

    minimal_gc._set_attributes(
        app_manifest=app_manifest,
    )
    assert not hasattr(minimal_gc, "addon_name")
    assert not hasattr(minimal_gc, "addon_version")
    assert not hasattr(minimal_gc, "addon_display_name")
    assert not hasattr(minimal_gc, "check_for_update")
    assert not hasattr(minimal_gc, "supported_themes")


@patch("addonfactory_splunk_conf_parser_lib.TABConfigParser")
def test_set_attributes_supported_themes_absent(
    mock_tab_config_parser,
    global_config,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    app_manifest,
):
    mock_tab_parser_instance = MagicMock()
    mock_tab_parser_instance.item_dict.return_value = {
        "package": {"check_for_updates": True},
        "ui": {},  # No supported_themes key
    }
    mock_tab_config_parser.return_value = mock_tab_parser_instance

    minimal_gc = MinimalGlobalConfig(
        global_config=global_config,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
        app_manifest=app_manifest,
    )

    minimal_gc._set_attributes(app_manifest=app_manifest)

    assert minimal_gc.supported_themes == ""


@patch("addonfactory_splunk_conf_parser_lib.TABConfigParser")
def test_set_attributes(
    mock_tab_config_parser,
    global_config,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    app_manifest,
):
    mock_tab_parser_instance = MagicMock()
    mock_tab_parser_instance.item_dict.return_value = {
        "package": {"check_for_updates": True},
        "ui": {"supported_themes": "dark, light"},
    }
    mock_tab_config_parser.return_value = mock_tab_parser_instance
    minimal_gc = MinimalGlobalConfig(
        global_config=global_config,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
        app_manifest=app_manifest,
    )

    minimal_gc._set_attributes(
        app_manifest=app_manifest,
    )
    assert minimal_gc.addon_name == "test_addon"
    assert minimal_gc.addon_version == "1.0.0"
    assert minimal_gc.addon_display_name == "Test title"
    assert minimal_gc.check_for_update is True
    assert minimal_gc.supported_themes == '["dark", "light"]'


def test_minimal_gc_with_globalconfig(
    valid_global_config,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    app_manifest,
):
    minimal_gc = MinimalGlobalConfig(
        global_config=valid_global_config,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
        app_manifest=app_manifest,
    )
    file_path = minimal_gc.generate_globalconfig()
    assert file_path is None


@patch("os.path.join", return_value="source_code/globalConfig.json")
@patch("addonfactory_splunk_conf_parser_lib.TABConfigParser")
@patch.object(MinimalGlobalConfig, "set_template_and_render")
def test_generate_minimal_gc(
    mock_template,
    mock_tab_config_parser,
    mock_join,
    global_config,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    app_manifest,
):
    content = "content"
    exp_fname = "globalConfig.json"
    file_path = "source_code/globalConfig.json"

    mock_tab_parser_instance = MagicMock()
    mock_tab_parser_instance.item_dict.return_value = {
        "package": {"check_for_updates": True},
        "ui": {"supported_themes": "dark, light"},
    }
    mock_tab_config_parser.return_value = mock_tab_parser_instance
    template_render = MagicMock()
    template_render.render.return_value = content

    minimal_gc = MinimalGlobalConfig(
        global_config,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
        app_manifest=app_manifest,
    )
    minimal_gc.writer = MagicMock()
    minimal_gc._template = template_render
    file_paths = minimal_gc.generate_globalconfig()

    assert mock_template.call_count == 1
    minimal_gc.writer.assert_called_once_with(
        file_name=exp_fname,
        file_path=file_path,
        content=content,
    )
    assert file_paths == {exp_fname: file_path}
