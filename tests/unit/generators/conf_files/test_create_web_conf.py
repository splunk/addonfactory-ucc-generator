from textwrap import dedent

from pytest import fixture
from unittest.mock import patch, MagicMock

from splunk_add_on_ucc_framework.commands.rest_builder.user_defined_rest_handlers import (
    RestHandlerConfig,
)
from splunk_add_on_ucc_framework.generators.conf_files import WebConf
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from tests.unit.helpers import get_testdata_file_path


@fixture
def global_config():
    return GlobalConfig(get_testdata_file_path("valid_config.json"))


@fixture
def input_dir(tmp_path):
    return str(tmp_path / "input_dir")


@fixture
def output_dir(tmp_path):
    return str(tmp_path / "output_dir")


@fixture
def ucc_dir(tmp_path):
    return str(tmp_path / "ucc_dir")


@fixture
def ta_name():
    return "test_addon"


def test_set_attributes(global_config, input_dir, output_dir, ucc_dir, ta_name):
    web_conf = WebConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    expected_endpoints = ["endpoint"]

    web_conf._gc_schema = MagicMock()
    web_conf._gc_schema.endpoints = expected_endpoints

    web_conf._set_attributes()

    assert web_conf.endpoints == expected_endpoints


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.WebConf.set_template_and_render"
)
@patch("splunk_add_on_ucc_framework.generators.conf_files.WebConf.get_file_output_path")
def test_generate_conf(
    mock_op_path, mock_template, global_config, input_dir, output_dir, ucc_dir, ta_name
):
    content = "content"
    exp_fname = "web.conf"
    file_path = "output_path/web.conf"
    mock_op_path.return_value = file_path
    template_render = MagicMock()
    template_render.render.return_value = content

    web_conf = WebConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )

    web_conf.writer = MagicMock()
    web_conf._template = template_render
    file_paths = web_conf.generate_conf()
    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1

    web_conf.writer.assert_called_once_with(
        file_name=exp_fname,
        file_path=file_path,
        content=content,
    )

    assert file_paths == {exp_fname: file_path}


def test_generate_conf_no_gc_schema(
    global_config, input_dir, output_dir, ucc_dir, ta_name
):
    web_conf = WebConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    web_conf._gc_schema = None

    file_paths = web_conf.generate_conf()
    assert file_paths is None


def test_web_conf_endpoints(global_config, input_dir, output_dir, ta_name):
    web_conf = WebConf(global_config, input_dir, output_dir, addon_name=ta_name)
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

    global_config.user_defined_handlers.add_definitions(
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

    web_conf = WebConf(global_config, input_dir, output_dir, addon_name=ta_name)
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
