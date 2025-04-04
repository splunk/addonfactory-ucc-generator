from pytest import fixture
from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.python_files import CustomCommandPy  # type: ignore[attr-defined]
import sys


@fixture
def custom_search_commands():
    return [
        {
            "commandName": "testcommand",
            "commandType": "generating",
            "fileName": "test.py",
            "requiredSearchAssistant": True,
            "description": "This is test command",
            "syntax": "testcommand count=<event_count> text=<string>",
            "usage": "public",
            "arguments": [
                {
                    "name": "count",
                    "required": True,
                    "validate": {"type": "Integer", "minimum": 5, "maximum": 10},
                },
                {
                    "name": "age",
                    "validate": {"type": "Integer", "minimum": 18},
                },
                {"name": "text", "required": True, "defaultValue": "test_text"},
            ],
        }
    ]


@fixture
def reporting_custom_search_command():
    return [
        {
            "commandName": "reportingcommand",
            "commandType": "reporting",
            "fileName": "reporting_test.py",
            "description": "This is a reporting command",
            "syntax": "reportingcommand action=<action>",
            "arguments": [
                {
                    "name": "action",
                    "required": True,
                    "validate": {"type": "Fieldname"},
                },
                {
                    "name": "test",
                },
            ],
        }
    ]


@patch.dict(sys.modules, {"reporting_test": MagicMock(map=True)})
def test_set_attributes_for_reporting_command(
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    reporting_custom_search_command,
):
    custom_command_py = CustomCommandPy(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
        custom_search_commands=reporting_custom_search_command,
    )

    assert custom_command_py.commands_info == [
        {
            "imported_file_name": "reporting_test",
            "file_name": "reportingcommand",
            "class_name": "Reportingcommand",
            "description": "This is a reporting command",
            "syntax": "reportingcommand action=<action>",
            "template": "reporting.template",
            "list_arg": [
                "action = Option(name='action', require=True, validate=validators.Fieldname(), default='')",
                "test = Option(name='test', require=False, default='')",
            ],
            "import_map": True,
        }
    ]


@patch.dict(sys.modules, {"reporting_test": MagicMock(spec=[])})
def test_set_attributes_for_reporting_command_without_map(
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    reporting_custom_search_command,
):
    custom_command_py = CustomCommandPy(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
        custom_search_commands=reporting_custom_search_command,
    )

    assert custom_command_py.commands_info == [
        {
            "imported_file_name": "reporting_test",
            "file_name": "reportingcommand",
            "class_name": "Reportingcommand",
            "description": "This is a reporting command",
            "syntax": "reportingcommand action=<action>",
            "template": "reporting.template",
            "list_arg": [
                "action = Option(name='action', require=True, validate=validators.Fieldname(), default='')",
                "test = Option(name='test', require=False, default='')",
            ],
            "import_map": False,
        }
    ]


def test_set_attributes_without_custom_command(
    global_config_only_configuration, input_dir, output_dir, ucc_dir, ta_name
):
    custom_command = CustomCommandPy(
        global_config_only_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert custom_command.commands_info == []


def test_set_attributes(
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    custom_search_commands,
):
    custom_command_py = CustomCommandPy(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
        custom_search_commands=custom_search_commands,
    )
    assert custom_command_py.commands_info == [
        {
            "imported_file_name": "test",
            "file_name": "testcommand",
            "class_name": "Testcommand",
            "description": "This is test command",
            "syntax": "testcommand count=<event_count> text=<string>",
            "template": "generating.template",
            "list_arg": [
                "count = Option(name='count', require=True, "
                "validate=validators.Integer(minimum=5, maximum=10), "
                "default='')",
                "age = Option(name='age', require=False, validate=validators.Integer(minimum=18), default='')",
                "text = Option(name='text', require=True, default='test_text')",
            ],
            "import_map": False,
        }
    ]


def test_generate_python_without_custom_command(
    global_config_only_configuration, input_dir, output_dir, ucc_dir, ta_name
):
    custom_command = CustomCommandPy(
        global_config_all_json=global_config_only_configuration,
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
    global_config_all_json,
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
        global_config_all_json,
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
