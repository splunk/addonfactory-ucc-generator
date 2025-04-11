from pytest import fixture
from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import SearchbnfConf  # type: ignore[attr-defined]


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
    file_paths = searchbnf_conf.generate_conf()

    # Assert that no files are returned since no custom command is configured
    assert file_paths is None


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.SearchbnfConf.set_template_and_render"
)
def test_generate_conf(
    mock_template, global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    content = "content"
    exp_fname = "searchbnf.conf"
    template_render = MagicMock()
    template_render.render.return_value = content

    searchbnf_conf = SearchbnfConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    searchbnf_conf._template = template_render
    file_paths = searchbnf_conf.generate_conf()

    assert mock_template.call_count == 1
    assert file_paths == {exp_fname: f"{output_dir}/{ta_name}/default/{exp_fname}"}
