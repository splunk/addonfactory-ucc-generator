import os.path
from textwrap import dedent
from unittest.mock import patch, MagicMock

from splunk_add_on_ucc_framework import __file__ as ucc_framework_file
from splunk_add_on_ucc_framework.commands.rest_builder.user_defined_rest_handlers import (
    RestHandlerConfig,
)
from splunk_add_on_ucc_framework.generators.conf_files import WebConf
from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.base import (
    RestEndpointBuilder,
)


UCC_DIR = os.path.dirname(ucc_framework_file)


def test_set_attributes(
    global_config_only_logging, input_dir, output_dir, ucc_dir, ta_name
):
    web_conf = WebConf(
        global_config_only_logging,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    # Had to specifically mention this to pass pre-commit check
    assert isinstance(web_conf.endpoints[0], RestEndpointBuilder)
    assert web_conf.endpoints[0].conf_name == "splunk_ta_uccexample_settings"


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.WebConf.set_template_and_render"
)
def test_generate_conf(
    mock_template,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    content = "content"
    exp_fname = "web.conf"
    template_render = MagicMock()
    template_render.render.return_value = content

    web_conf = WebConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    web_conf._template = template_render
    file_paths = web_conf.generate_conf()
    assert mock_template.call_count == 1

    assert file_paths == {exp_fname: f"{output_dir}/{ta_name}/default/{exp_fname}"}


def test_set_attribute_for_conf_only_TA(
    global_config_for_conf_only_TA, input_dir, output_dir, ucc_dir, ta_name
):
    web_conf = WebConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert web_conf.endpoints == []


def test_generate_conf_for_conf_only_TA(
    global_config_for_conf_only_TA, input_dir, output_dir, ucc_dir, ta_name
):
    web_conf = WebConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    file_paths = web_conf.generate_conf()
    assert file_paths is None


def test_web_conf_endpoints(global_config_all_json, input_dir, output_dir, ta_name):
    web_conf = WebConf(
        global_config_all_json,
        input_dir,
        output_dir,
        addon_name=ta_name,
        ucc_dir=UCC_DIR,
    )
    file_paths = web_conf.generate_conf()

    assert file_paths is not None
    assert file_paths.keys() == {"web.conf"}
    assert file_paths["web.conf"].endswith("test_addon/default/web.conf")

    with open(file_paths["web.conf"]) as fp:
        content = fp.read()

    expected_content = dedent(
        """
        [expose:splunk_ta_uccexample_account]
        pattern = splunk_ta_uccexample_account
        methods = POST, GET

        [expose:splunk_ta_uccexample_account_specified]
        pattern = splunk_ta_uccexample_account/*
        methods = POST, GET, DELETE

        [expose:splunk_ta_uccexample_oauth]
        pattern = splunk_ta_uccexample_oauth
        methods = POST, GET

        [expose:splunk_ta_uccexample_oauth_specified]
        pattern = splunk_ta_uccexample_oauth/*
        methods = POST, GET, DELETE

        [expose:splunk_ta_uccexample_settings]
        pattern = splunk_ta_uccexample_settings
        methods = POST, GET

        [expose:splunk_ta_uccexample_settings_specified]
        pattern = splunk_ta_uccexample_settings/*
        methods = POST, GET, DELETE

        [expose:splunk_ta_uccexample_example_input_one]
        pattern = splunk_ta_uccexample_example_input_one
        methods = POST, GET

        [expose:splunk_ta_uccexample_example_input_one_specified]
        pattern = splunk_ta_uccexample_example_input_one/*
        methods = POST, GET, DELETE

        [expose:splunk_ta_uccexample_example_input_two]
        pattern = splunk_ta_uccexample_example_input_two
        methods = POST, GET

        [expose:splunk_ta_uccexample_example_input_two_specified]
        pattern = splunk_ta_uccexample_example_input_two/*
        methods = POST, GET, DELETE
        """
    ).lstrip()

    assert content == expected_content

    global_config_all_json.user_defined_handlers.add_definitions(
        [
            RestHandlerConfig(
                name="name1",
                endpoint="endpoint1",
                handlerType="EAI",
                registerHandler={"file": "file1", "actions": ["list"]},
            ),
            RestHandlerConfig(
                name="name2",
                endpoint="endpoint2",
                handlerType="EAI",
                registerHandler={
                    "file": "file2",
                    "actions": ["list", "create", "delete", "edit"],
                },
            ),
            RestHandlerConfig(
                name="name3",
                endpoint="endpoint3",
                handlerType="EAI",
            ),
        ]
    )

    web_conf = WebConf(
        global_config_all_json,
        input_dir,
        output_dir,
        addon_name=ta_name,
        ucc_dir=UCC_DIR,
    )
    file_paths = web_conf.generate_conf()

    assert file_paths is not None
    with open(file_paths["web.conf"]) as fp:
        content = fp.read()

    expected_content += dedent(
        """
        [expose:endpoint1]
        pattern = endpoint1
        methods = POST, GET

        [expose:endpoint1_specified]
        pattern = endpoint1/*
        methods = POST, GET, DELETE

        [expose:endpoint2]
        pattern = endpoint2
        methods = POST, GET

        [expose:endpoint2_specified]
        pattern = endpoint2/*
        methods = POST, GET, DELETE
        """
    )

    assert content == expected_content
