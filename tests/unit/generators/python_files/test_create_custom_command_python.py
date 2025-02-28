from pytest import fixture
from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.python_files import CustomCommandPy
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
            "requireSeachAssistant": True,
            "version": 2,
            "description": "This is test command",
            "syntax": "testcommand count=<event_count> text=<string>",
            "usage": "public",
            "arguments": [
                {
                    "name": "count",
                    "required": True,
                    "validate": {"type": "Integer", "minimum": 5, "maximum": 10},
                },
                {"name": "text", "required": True},
            ],
        }
    ]


def test_set_attributes_without_custom_command(
    global_config_without_custom_command, input_dir, output_dir, ucc_dir, ta_name
):
    custom_command = CustomCommandPy(
        global_config_without_custom_command,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert custom_command.commands_info == []


def test_set_attributes(
    global_config, input_dir, output_dir, ucc_dir, ta_name, custom_search_commands
):
    custom_command_py = CustomCommandPy(
        global_config,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
        custom_search_commands=custom_search_commands,
    )
    custom_command_py._set_attributes(custom_search_commands=custom_search_commands)
    assert custom_command_py.commands_info == [
        {
            "imported_file_name": "test",
            "file_name": "testcommand",
            "class_name": "Testcommand",
            "description": "This is test command",
            "syntax": "testcommand count=<event_count> text=<string>",
            "template": "generating.template",
            "arguments": [
                {
                    "name": "count",
                    "require": True,
                    "validate": {"type": "Integer", "minimum": 5, "maximum": 10},
                    "default": None,
                },
                {"name": "text", "require": True, "validate": None, "default": None},
            ],
            "import_map": False,
        }
    ]


def test_generate_python_without_custom_command(
    global_config_without_custom_command, input_dir, output_dir, ucc_dir, ta_name
):
    custom_command = CustomCommandPy(
        global_config=global_config_without_custom_command,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    mock_writer = MagicMock()
    with patch.object(custom_command, "writer", mock_writer):
        file_paths = custom_command.generate_python()

        # Assert that no files are returned since no custom command is configured
        assert file_paths is None


@patch(
    "splunk_add_on_ucc_framework.generators.python_files.CustomCommandPy.set_template_and_render"
)
@patch(
    "splunk_add_on_ucc_framework.generators.python_files.CustomCommandPy.get_file_output_path"
)
def test_generate_python(
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
    exp_fname = "testcommand.py"
    file_path = "output_path/testcommand.py"
    mock_op_path.return_value = file_path
    template_render = MagicMock()
    template_render.render.return_value = content

    custom_command_py = CustomCommandPy(
        global_config,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
        custom_search_commands=custom_search_commands,
    )
    custom_command_py.writer = MagicMock()
    custom_command_py._template = template_render
    file_paths = custom_command_py.generate_python()

    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1
    custom_command_py.writer.assert_called_once_with(
        file_name=exp_fname, file_path=file_path, content=content
    )
    assert file_paths == {exp_fname: file_path}
