from pytest import fixture
from splunk_add_on_ucc_framework.generators.python_files import CustomCommandPy


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
                {"name": "contains"},
                {"name": "fieldname", "validate": {"type": "Fieldname"}},
            ],
        }
    ]


def test_set_attributes_without_custom_command(
    global_config_only_configuration,
    input_dir,
    output_dir,
):
    custom_command = CustomCommandPy(
        global_config_only_configuration,
        input_dir,
        output_dir,
    )
    assert custom_command.commands_info == []


def test_set_attributes(
    global_config_all_json,
    input_dir,
    output_dir,
    custom_search_commands,
):
    global_config_all_json._content["customSearchCommand"] = custom_search_commands
    custom_command_py = CustomCommandPy(
        global_config_all_json,
        input_dir,
        output_dir,
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
                "contains = Option(name='contains', require=False)",
                "fieldname = Option(name='fieldname', require=False, validate=validators.Fieldname())",
            ],
        }
    ]


def test_generate_python_without_custom_command(
    global_config_only_configuration,
    input_dir,
    output_dir,
):
    custom_command = CustomCommandPy(
        global_config_only_configuration,
        input_dir,
        output_dir,
    )
    file_paths = custom_command.generate()

    # Assert that no files are returned since no custom command is configured
    assert file_paths == {}


def test_generate_python(global_config_all_json, input_dir, output_dir, ta_name):
    exp_fname = "generatetextcommand.py"
    global_config_all_json.meta["name"] = ta_name
    custom_command_py = CustomCommandPy(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    file_paths = custom_command_py.generate()
    assert file_paths == {exp_fname: f"{output_dir}/{ta_name}/bin/{exp_fname}"}
