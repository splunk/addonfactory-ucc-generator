import os.path
from textwrap import dedent
from unittest.mock import patch, MagicMock

from splunk_add_on_ucc_framework import __file__ as ucc_framework_file
from splunk_add_on_ucc_framework.commands.rest_builder.user_defined_rest_handlers import (
    RestHandlerConfig,
)
from splunk_add_on_ucc_framework.generators.conf_files import RestMapConf


UCC_DIR = os.path.dirname(ucc_framework_file)


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.RestMapConf.set_template_and_render"
)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.RestMapConf.get_file_output_path"
)
def test_generate_conf(
    mock_op_path,
    mock_template,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    content = "content"
    exp_fname = "restmap.conf"
    file_path = "output_path/restmap.conf"
    mock_op_path.return_value = file_path
    template_render = MagicMock()
    template_render.render.return_value = content

    restmap_conf = RestMapConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    restmap_conf.writer = MagicMock()
    restmap_conf._template = template_render
    file_paths = restmap_conf.generate_conf()
    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1

    # Ensure the writer function was called with the correct parameters
    restmap_conf.writer.assert_called_once_with(
        file_name=exp_fname,
        file_path=file_path,
        content=content,
    )

    assert file_paths == {exp_fname: file_path}


def test_generate_conf_no_gc_schema(
    global_config_for_conf_only_TA, input_dir, output_dir, ucc_dir, ta_name
):
    restmap_conf = RestMapConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    file_paths = restmap_conf.generate_conf()
    assert file_paths is None


def test_generate_conf_for_conf_only_TA(
    global_config_for_conf_only_TA, input_dir, output_dir, ucc_dir, ta_name
):
    restmap_conf = RestMapConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    file_paths = restmap_conf.generate_conf()
    assert file_paths is None


def test_set_attributes(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    restmap_conf = RestMapConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    restmap_conf._set_attributes()
    assert hasattr(restmap_conf, "endpoints")
    assert hasattr(restmap_conf, "endpoint_names")
    assert hasattr(restmap_conf, "namespace")


def test_restmap_endpoints(global_config_all_json, input_dir, output_dir, ta_name):
    expected_top = (
        "[admin:splunk_ta_uccexample]\n"
        "match = /\n"
        "members = splunk_ta_uccexample_account, splunk_ta_uccexample_example_input_one, "
        "splunk_ta_uccexample_example_input_two, splunk_ta_uccexample_oauth, splunk_ta_uccexample_settings\n\n"
    )

    expected_content = dedent(
        """
        [admin_external:splunk_ta_uccexample_account]
        handlertype = python
        python.version = python3
        handlerfile = splunk_ta_uccexample_rh_account.py
        handleractions = edit, list, remove, create
        handlerpersistentmode = true

        [admin_external:splunk_ta_uccexample_oauth]
        handlertype = python
        python.version = python3
        handlerfile = splunk_ta_uccexample_rh_oauth.py
        handleractions = edit
        handlerpersistentmode = true

        [admin_external:splunk_ta_uccexample_settings]
        handlertype = python
        python.version = python3
        handlerfile = splunk_ta_uccexample_rh_settings.py
        handleractions = edit, list
        handlerpersistentmode = true

        [admin_external:splunk_ta_uccexample_example_input_one]
        handlertype = python
        python.version = python3
        handlerfile = splunk_ta_uccexample_rh_example_input_one.py
        handleractions = edit, list, remove, create
        handlerpersistentmode = true

        [admin_external:splunk_ta_uccexample_example_input_two]
        handlertype = python
        python.version = python3
        handlerfile = splunk_ta_uccexample_rh_example_input_two.py
        handleractions = edit, list, remove, create
        handlerpersistentmode = true
        """
    ).lstrip()
    restmap_conf = RestMapConf(
        global_config_all_json,
        input_dir,
        output_dir,
        addon_name=ta_name,
        ucc_dir=UCC_DIR,
    )
    file_paths = restmap_conf.generate_conf()

    assert file_paths is not None
    assert file_paths.keys() == {"restmap.conf"}

    with open(file_paths["restmap.conf"]) as fp:
        content = fp.read()

    assert content == (expected_top + expected_content)

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

    restmap_conf = RestMapConf(
        global_config_all_json,
        input_dir,
        output_dir,
        addon_name=ta_name,
        ucc_dir=UCC_DIR,
    )
    file_paths = restmap_conf.generate_conf()

    assert file_paths is not None
    assert file_paths.keys() == {"restmap.conf"}

    with open(file_paths["restmap.conf"]) as fp:
        content = fp.read()

    expected_top = expected_top.replace("members =", "members = endpoint1, endpoint2,")

    expected_content += dedent(
        """
        [admin_external:endpoint1]
        handlertype = python
        python.version = python3
        handlerfile = file1.py
        handleractions = list
        handlerpersistentmode = true

        [admin_external:endpoint2]
        handlertype = python
        python.version = python3
        handlerfile = file2.py
        handleractions = list, create, delete, edit
        handlerpersistentmode = true
        """
    )

    assert content == expected_top + expected_content
