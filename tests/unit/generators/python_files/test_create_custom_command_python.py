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
def transforming_custom_search_command():
    return [
        {
            "commandName": "transformingcommand",
            "commandType": "transforming",
            "fileName": "transforming_test.py",
            "description": "This is a transforming command",
            "syntax": "transformingcommand action=<action>",
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


@patch.dict(sys.modules, {"transforming_test": MagicMock(map=True)})
def test_set_attributes_for_transforming_command(
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    transforming_custom_search_command,
):
    global_config_all_json._content[
        "customSearchCommand"
    ] = transforming_custom_search_command
    custom_command_py = CustomCommandPy(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert custom_command_py.commands_info == [
        {
            "imported_file_name": "transforming_test",
            "file_name": "transformingcommand",
            "class_name": "Transformingcommand",
            "description": "This is a transforming command",
            "syntax": "transformingcommand action=<action>",
            "template": "transforming.template",
            "list_arg": [
                "action = Option(name='action', require=True, validate=validators.Fieldname())",
                "test = Option(name='test', require=False)",
            ],
            "import_map": True,
        }
    ]


@patch.dict(sys.modules, {"transforming_test": MagicMock(spec=[])})
def test_set_attributes_for_transforming_command_without_map(
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    transforming_custom_search_command,
):
    global_config_all_json._content[
        "customSearchCommand"
    ] = transforming_custom_search_command
    custom_command_py = CustomCommandPy(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert custom_command_py.commands_info == [
        {
            "imported_file_name": "transforming_test",
            "file_name": "transformingcommand",
            "class_name": "Transformingcommand",
            "description": "This is a transforming command",
            "syntax": "transformingcommand action=<action>",
            "template": "transforming.template",
            "list_arg": [
                "action = Option(name='action', require=True, validate=validators.Fieldname())",
                "test = Option(name='test', require=False)",
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
    global_config_all_json._content["customSearchCommand"] = custom_search_commands
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
                "validate=validators.Integer(minimum=5, maximum=10))",
                "age = Option(name='age', require=False, validate=validators.Integer(minimum=18))",
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
    file_paths = custom_command.generate()

    # Assert that no files are returned since no custom command is configured
    assert file_paths == {"": ""}


@patch(
    "splunk_add_on_ucc_framework.generators.python_files.CustomCommandPy.set_template_and_render"
)
def test_generate_python(
    mock_template, global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    content = "content"
    exp_fname = "generatetextcommand.py"
    template_render = MagicMock()
    template_render.render.return_value = content

    custom_command_py = CustomCommandPy(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    custom_command_py._template = template_render
    file_paths = custom_command_py.generate()

    assert mock_template.call_count == 1
    assert file_paths == {exp_fname: f"{output_dir}/{ta_name}/bin/{exp_fname}"}
