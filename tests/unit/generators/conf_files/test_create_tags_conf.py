from pytest import fixture
from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import TagsConf
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from tests.unit.helpers import get_testdata_file_path


@fixture
def global_config():
    return GlobalConfig(get_testdata_file_path("valid_config.json"))


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


def test_set_attribute(global_config, input_dir, output_dir, ucc_dir, ta_name):
    tags_conf = TagsConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )

    tags_conf._set_attributes()
    assert tags_conf.alert_settings
    assert tags_conf.conf_file == "tags.conf"


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.TagsConf.set_template_and_render"
)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.TagsConf.get_file_output_path"
)
def test_generate_conf(
    mock_op_path, mock_template, global_config, input_dir, output_dir, ucc_dir, ta_name
):
    content = "content"
    exp_fname = "tags.conf"
    file_path = "output_path/tags.conf"
    mock_op_path.return_value = file_path
    template_render = MagicMock()
    template_render.render.return_value = content

    tags_conf = TagsConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )

    tags_conf.writer = MagicMock()
    tags_conf._template = template_render
    file_paths = tags_conf.generate_conf()

    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1

    tags_conf.writer.assert_called_once_with(
        file_name=exp_fname,
        file_path=file_path,
        content=content,
    )

    assert file_paths == {exp_fname: file_path}


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.TagsConf._set_attributes",
    return_value=MagicMock(),
)
def test_generate_conf_no_alert_settings(
    global_config, input_dir, output_dir, ucc_dir, ta_name
):
    tags_conf = TagsConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )

    tags_conf.alert_settings = {}
    file_paths = tags_conf.generate_conf()
    assert file_paths is None