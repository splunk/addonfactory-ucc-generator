import os.path
from textwrap import dedent

from splunk_add_on_ucc_framework import __file__ as ucc_framework_file
from splunk_add_on_ucc_framework.commands.rest_builder.user_defined_rest_handlers import (
    RestHandlerConfig,
)
from splunk_add_on_ucc_framework.generators.conf_files import RestMapConf


UCC_DIR = os.path.dirname(ucc_framework_file)


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

    file_paths = restmap_conf.generate()
    assert file_paths == [{}]


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

    file_paths = restmap_conf.generate()
    assert file_paths == [{}]


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
        [admin_external:splunk_ta_uccexample_oauth]
        handlertype = python
        python.version = python3
        handlerfile = splunk_ta_uccexample_rh_oauth.py
        handleractions = edit
        handlerpersistentmode = true
        [admin_external:splunk_ta_uccexample_account]
        handlertype = python
        python.version = python3
        handlerfile = splunk_ta_uccexample_rh_account.py
        handleractions = edit, list, remove, create
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
    output = restmap_conf.generate()

    assert output[0]["file_name"] == "restmap.conf"

    assert output[0]["content"] == (expected_top + expected_content)

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
    output = restmap_conf.generate()
    assert output[0]["file_name"] == "restmap.conf"

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
    ).lstrip()

    assert output[0]["content"] == expected_top + expected_content
