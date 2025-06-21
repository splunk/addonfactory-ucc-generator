from splunk_add_on_ucc_framework.generators.conf_files import CommandsConf
from textwrap import dedent


def test_set_attributes_without_custom_command(
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


def test_set_attributes(
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
    file_paths = commands_conf.generate()

    # Assert that no files are returned since no custom command is configured
    assert file_paths == {}


def test_commands_conf_generation(
    global_config_all_json, input_dir, output_dir, ta_name
):
    global_config_all_json.meta["name"] = ta_name
    commands_conf = CommandsConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    file_paths = commands_conf.generate()

    assert file_paths is not None
    assert file_paths.keys() == {"commands.conf"}
    assert file_paths["commands.conf"].endswith(f"{ta_name}/default/commands.conf")

    with open(file_paths["commands.conf"]) as fp:
        content = fp.read()

    expected_content = dedent(
        """
        [generatetextcommand]
        filename = generatetextcommand.py
        chunked = true
        python.version = python3
        """
    ).lstrip()
    assert content == expected_content
