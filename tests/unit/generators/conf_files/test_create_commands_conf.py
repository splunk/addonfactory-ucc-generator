from splunk_add_on_ucc_framework.generators.conf_files import CommandsConf
from splunk_add_on_ucc_framework import __file__ as ucc_framework_file
import os.path
from textwrap import dedent

UCC_DIR = os.path.dirname(ucc_framework_file)


def test_set_attributes_without_custom_command(
    global_config_only_configuration, input_dir, output_dir, ucc_dir, ta_name
):
    commands_conf = CommandsConf(
        global_config_only_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert not hasattr(commands_conf, "command_names")


def test_set_attributes(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    commands_conf = CommandsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert commands_conf.conf_file == "commands.conf"
    assert commands_conf.command_names == ["generatetextcommand"]


def test_generate_conf_without_custom_command(
    global_config_only_configuration, input_dir, output_dir, ucc_dir, ta_name
):
    commands_conf = CommandsConf(
        global_config_only_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    file_paths = commands_conf.generate()

    # Assert that no files are returned since no custom command is configured
    assert file_paths == {}


def test_commands_conf_generation(
    global_config_all_json, input_dir, output_dir, ta_name
):
    commands_conf = CommandsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        addon_name=ta_name,
        ucc_dir=UCC_DIR,
    )
    file_paths = commands_conf.generate()

    assert file_paths is not None
    assert file_paths.keys() == {"commands.conf"}
    assert file_paths["commands.conf"].endswith("test_addon/default/commands.conf")

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
