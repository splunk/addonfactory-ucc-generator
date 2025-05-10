from pytest import fixture
from splunk_add_on_ucc_framework.generators.conf_files import SearchbnfConf
from splunk_add_on_ucc_framework import __file__ as ucc_framework_file
import os.path
from textwrap import dedent

UCC_DIR = os.path.dirname(ucc_framework_file)


@fixture
def custom_search_command_without_search_assistance():
    return [
        {
            "commandName": "testcommand2",
            "commandType": "streaming",
            "fileName": "test2.py",
        }
    ]


def test_set_attributes_without_custom_command(
    global_config_only_configuration, input_dir, output_dir, ucc_dir, ta_name
):
    searchbnf_conf = SearchbnfConf(
        global_config_only_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert searchbnf_conf.searchbnf_info == []


def test_set_attributes(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    searchbnf_conf = SearchbnfConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert searchbnf_conf.conf_file == "searchbnf.conf"
    assert searchbnf_conf.searchbnf_info == [
        {
            "command_name": "generatetextcommand",
            "description": "This command generates COUNT occurrences of a TEXT string.",
            "syntax": "generatetextcommand count=<event_count> text=<string>",
            "usage": "public",
        }
    ]


def test_set_attributes_without_search_assistance(
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    custom_search_command_without_search_assistance,
):
    global_config_all_json._content[
        "customSearchCommand"
    ] = custom_search_command_without_search_assistance
    searchbnf_conf = SearchbnfConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert searchbnf_conf.searchbnf_info == []


def test_generate_conf_without_custom_command(
    global_config_only_configuration, input_dir, output_dir, ucc_dir, ta_name
):
    searchbnf_conf = SearchbnfConf(
        global_config_only_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    file_paths = searchbnf_conf.generate()

    # Assert that no files are returned since no custom command is configured
    assert file_paths == {}


def test_generate_conf(global_config_all_json, input_dir, output_dir, ta_name):
    searchbnf_conf = SearchbnfConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=UCC_DIR,
        addon_name=ta_name,
    )
    file_paths = searchbnf_conf.generate()
    exp_fname = "searchbnf.conf"

    assert file_paths == {exp_fname: f"{output_dir}/{ta_name}/default/{exp_fname}"}

    with open(file_paths["searchbnf.conf"]) as fp:
        content = fp.read()

    expected_content = dedent(
        """
        [generatetextcommand]
        syntax = generatetextcommand count=<event_count> text=<string>
        description = This command generates COUNT occurrences of a TEXT string.
        usage = public
        """
    ).lstrip()

    assert content == expected_content
