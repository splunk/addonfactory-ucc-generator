from splunk_add_on_ucc_framework.generators.conf_files import CommandsConf
from textwrap import dedent


def test_init_without_custom_command(
    global_config_only_configuration,
    input_dir,
    output_dir,
):
    commands_conf = CommandsConf(
        global_config_only_configuration,
        input_dir,
        output_dir,
    )
    assert not hasattr(commands_conf, "command_names")


def test_init(
    global_config_all_json,
    input_dir,
    output_dir,
):
    commands_conf = CommandsConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    assert commands_conf.conf_file == "commands.conf"
    assert commands_conf.command_names == ["generatetextcommand"]


def test_generate_conf_without_custom_command(
    global_config_only_configuration,
    input_dir,
    output_dir,
):
    commands_conf = CommandsConf(
        global_config_only_configuration,
        input_dir,
        output_dir,
    )
    output = commands_conf.generate()

    # Assert that no files are returned since no custom command is configured
    assert output is None


def test_commands_conf_generation(global_config_all_json, input_dir, output_dir):
    ta_name = global_config_all_json.product
    commands_conf = CommandsConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    output = commands_conf.generate_conf()

    expected_content = dedent(
        """
        [generatetextcommand]
        filename = generatetextcommand.py
        chunked = true
        python.version = python3
        python.required = 3.7, 3.13
        """
    ).lstrip()
    assert output == {
        "file_name": "commands.conf",
        "file_path": f"{output_dir}/{ta_name}/default/commands.conf",
        "content": expected_content,
    }


def test_commands_conf_spec_generation(global_config_all_json, input_dir, output_dir):
    ta_name = global_config_all_json.product
    commands_conf = CommandsConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    output = commands_conf.generate_conf_spec()
    expected_content = "\n".join(
        [
            "[default]",
            "python.required = {3.7|3.9|3.13}",
            "* For Python scripts only, selects which Python version to use.",
            '* Set to "3.9" to use the Python 3.9 version.',
            '* Set to "3.13" to use the Python 3.13 version.',
            "* Optional.",
            "* Default: not set",
        ]
    )
    assert output == {
        "file_name": "commands.conf.spec",
        "file_path": f"{output_dir}/{ta_name}/README/commands.conf.spec",
        "content": expected_content,
    }
