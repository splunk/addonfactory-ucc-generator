from pytest import fixture
from splunk_add_on_ucc_framework.generators.python_files import CustomCommandPy
from textwrap import dedent


def normalize_code(code: str) -> str:
    return dedent(code).replace("\\\n", " ").replace("\n", "").replace(" ", "")


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
                    "name": "max_word",
                    "validate": {"type": "Integer", "maximum": 100},
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


def test_init_without_custom_command(
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


def test_init(
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
                "max_word = Option(name='max_word', require=False, validate=validators.Integer(maximum=100))",
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
    output = custom_command.generate()

    # Assert that no files are returned since no custom command is configured
    assert output is None


def test_generate_python(global_config_all_json, input_dir, output_dir):
    exp_fname = "generatetextcommand.py"
    ta_name = global_config_all_json.meta["name"]
    custom_command_py = CustomCommandPy(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    output = custom_command_py.generate()
    expected_content = '''
import sys
import import_declare_test

from splunklib.searchcommands import \\
    dispatch, GeneratingCommand, Configuration, Option, validators
from generatetext import generate

@Configuration()
class GeneratetextcommandCommand(GeneratingCommand):
    """

    ##Syntax
    generatetextcommand count=<event_count> text=<string>

    ##Description
    This command generates COUNT occurrences of a TEXT string.

    """
    count = Option(name='count', require=True, validate=validators.Integer(minimum=5, maximum=10))
    text = Option(name='text', require=True)

    def generate(self):
       return generate(self)

dispatch(GeneratetextcommandCommand, sys.argv, sys.stdin, sys.stdout, __name__)
    '''
    assert output is not None
    assert normalize_code(output[0]["content"]) == normalize_code(expected_content)
    assert output[0]["file_name"] == exp_fname
    assert output[0]["file_path"] == f"{output_dir}/{ta_name}/bin/{exp_fname}"
