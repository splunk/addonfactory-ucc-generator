from pytest import fixture
from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import AppConf


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


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.AppConf.set_template_and_render"
)
@patch("splunk_add_on_ucc_framework.generators.conf_files.AppConf.get_file_output_path")
def test_generate_conf(
    mock_op_path,
    mock_template,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    addon_version,
    has_ui,
    app_manifest,
):
    content = "content"
    exp_fname = "app.conf"
    file_path = "output_path/app.conf"
    mock_op_path.return_value = file_path
    template_render = MagicMock()
    template_render.render.return_value = content

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
    app_conf.writer = MagicMock()
    app_conf._template = template_render
    file_paths = app_conf.generate()

    # Ensure the appropriate methods were called and the file was generated
    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1
    app_conf.writer.assert_called_once_with(
        file_name=exp_fname,
        file_path=file_path,
        content=content,
        merge_mode="item_overwrite",
    )
    assert file_paths == {exp_fname: file_path}
