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


@fixture
def custom_search_command_without_optional_search_assistance_params():
    return [
        {
            "commandName": "generatetextcommand",
            "commandType": "generating",
            "fileName": "generatetext.py",
            "requiredSearchAssistant": True,
            "description": "This command generates COUNT occurrences of a TEXT string.",
            "syntax": "generatetextcommand count=<event_count> text=<string>",
            "usage": "public",
        }
    ]


def test_init_without_custom_command(
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


def test_init(
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
            "shortdesc": "Command for generating string events.",
            "syntax": "generatetextcommand count=<event_count> text=<string>",
            "usage": "public",
            "tags": "text generator",
            "examples": [
                {
                    "search": '| generatetextcommand count=5 text="example string"',
                    "comment": 'Generates 5 events with text="example string"',
                },
                {
                    "search": '| generatetextcommand count=10 text="another example string"',
                    "comment": 'Generates 10 events with text="another example string"',
                },
            ],
        }
    ]


def test_init_without_search_assistance(
    global_config_all_json,
    input_dir,
    output_dir,
    custom_search_command_without_search_assistance,
):
    global_config_all_json._content["customSearchCommand"] = (
        custom_search_command_without_search_assistance
    )
    searchbnf_conf = SearchbnfConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    assert searchbnf_conf.searchbnf_info == []


def test_init_without_optional_search_assistance_params(
    global_config_all_json,
    input_dir,
    output_dir,
    custom_search_command_without_optional_search_assistance_params,
):
    global_config_all_json._content["customSearchCommand"] = (
        custom_search_command_without_optional_search_assistance_params
    )
    searchbnf_conf = SearchbnfConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    assert searchbnf_conf.searchbnf_info == [
        {
            "command_name": "generatetextcommand",
            "description": "This command generates COUNT occurrences of a TEXT string.",
            "syntax": "generatetextcommand count=<event_count> text=<string>",
            "usage": "public",
            "examples": [],
            "shortdesc": None,
            "tags": None,
        }
    ]


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
        [generatetextcommand-command]
        syntax = generatetextcommand count=<event_count> text=<string>
        description = This command generates COUNT occurrences of a TEXT string.
        shortdesc = Command for generating string events.
        usage = public
        tags = text generator
        example1 = | generatetextcommand count=5 text="example string"
        comment1 = Generates 5 events with text="example string"
        example2 = | generatetextcommand count=10 text="another example string"
        comment2 = Generates 10 events with text="another example string"
        """
    ).lstrip()
    assert output == [
        {
            "file_name": exp_fname,
            "file_path": f"{output_dir}/{ta_name}/default/{exp_fname}",
            "content": expected_content,
        }
    ]


def test_generate_conf_without_optional_search_assistance_params(
    global_config_all_json,
    input_dir,
    output_dir,
    custom_search_command_without_optional_search_assistance_params,
):
    global_config_all_json._content["customSearchCommand"] = (
        custom_search_command_without_optional_search_assistance_params
    )
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
        [generatetextcommand-command]
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
