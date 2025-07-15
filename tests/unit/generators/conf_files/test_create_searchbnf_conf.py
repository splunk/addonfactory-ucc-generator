from pytest import fixture
from splunk_add_on_ucc_framework.generators.conf_files import SearchbnfConf
from textwrap import dedent


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
    global_config_only_configuration,
    input_dir,
    output_dir,
):
    searchbnf_conf = SearchbnfConf(
        global_config_only_configuration,
        input_dir,
        output_dir,
    )
    assert searchbnf_conf.searchbnf_info == []


def test_set_attributes(
    global_config_all_json,
    input_dir,
    output_dir,
):
    searchbnf_conf = SearchbnfConf(
        global_config_all_json,
        input_dir,
        output_dir,
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
    custom_search_command_without_search_assistance,
):
    global_config_all_json._content[
        "customSearchCommand"
    ] = custom_search_command_without_search_assistance
    searchbnf_conf = SearchbnfConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    assert searchbnf_conf.searchbnf_info == []


def test_generate_conf_without_custom_command(
    global_config_only_configuration,
    input_dir,
    output_dir,
):
    searchbnf_conf = SearchbnfConf(
        global_config_only_configuration,
        input_dir,
        output_dir,
    )
    file_paths = searchbnf_conf.generate()

    # Assert that no files are returned since no custom command is configured
    assert file_paths is None


def test_generate_conf(global_config_all_json, input_dir, output_dir):
    ta_name = global_config_all_json.product
    searchbnf_conf = SearchbnfConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    output = searchbnf_conf.generate()
    exp_fname = "searchbnf.conf"
    expected_content = dedent(
        """
        [generatetextcommand]
        syntax = generatetextcommand count=<event_count> text=<string>
        description = This command generates COUNT occurrences of a TEXT string.
        usage = public
        """
    ).lstrip()
    assert output == [
        {
            "file_name": exp_fname,
            "file_path": f"{output_dir}/{ta_name}/default/{exp_fname}",
            "content": expected_content,
        }
    ]
