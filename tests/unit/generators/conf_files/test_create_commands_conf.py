from pytest import fixture
from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import CommandsConf
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from tests.unit.helpers import get_testdata_file_path


@fixture
def global_config():
    return GlobalConfig(get_testdata_file_path("valid_config.json"))


@fixture
def global_config_without_custom_command():
    return GlobalConfig(get_testdata_file_path("valid_config_only_configuration.json"))


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


@fixture
def custom_search_commands():
    return [
        {
            "commandName": "testcommand",
            "commandType": "generating",
            "fileName": "test.py",
            "requiredSearchAssistant": False,
        }
    ]


def test_set_attributes_without_custom_command(
    global_config_without_custom_command, input_dir, output_dir, ucc_dir, ta_name
):
    commands_conf = CommandsConf(
        global_config_without_custom_command,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert not hasattr(commands_conf, "command_names")


def test_set_attributes(
    global_config, input_dir, output_dir, ucc_dir, ta_name, custom_search_commands
):
    commands_conf = CommandsConf(
        global_config,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
        custom_search_commands=custom_search_commands,
    )
    commands_conf._set_attributes(custom_search_commands=custom_search_commands)
    assert commands_conf.conf_file == "commands.conf"
    assert commands_conf.command_names == ["testcommand"]


def test_generate_conf_without_custom_command(
    global_config_without_custom_command, input_dir, output_dir, ucc_dir, ta_name
):
    commands_conf = CommandsConf(
        global_config_without_custom_command,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    mock_writer = MagicMock()
    with patch.object(commands_conf, "writer", mock_writer):
        file_paths = commands_conf.generate_conf()

        # Assert that no files are returned since no custom command is configured
        assert file_paths is None


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.CommandsConf.set_template_and_render"
)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.CommandsConf.get_file_output_path"
)
def test_generate_conf(
    mock_op_path,
    mock_template,
    global_config,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    custom_search_commands,
):
    content = "content"
    exp_fname = "commands.conf"
    file_path = "output_path/commands.conf"
    mock_op_path.return_value = file_path
    template_render = MagicMock()
    template_render.render.return_value = content

    commands_conf = CommandsConf(
        global_config,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
        custom_search_commands=custom_search_commands,
    )
    commands_conf.writer = MagicMock()
    commands_conf._template = template_render
    file_paths = commands_conf.generate_conf()

    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1
    commands_conf.writer.assert_called_once_with(
        file_name=exp_fname, file_path=file_path, content=content
    )
    assert file_paths == {exp_fname: file_path}
