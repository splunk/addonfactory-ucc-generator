from textwrap import dedent
from splunk_add_on_ucc_framework.generators.conf_files import RestMapConf


def test_generate_conf_no_gc_schema(
    global_config_for_conf_only_TA,
    input_dir,
    output_dir,
):
    restmap_conf = RestMapConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
    )

    file_paths = restmap_conf.generate()
    assert file_paths is None


def test_generate_conf_for_conf_only_TA(
    global_config_for_conf_only_TA,
    input_dir,
    output_dir,
):
    restmap_conf = RestMapConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
    )

    file_paths = restmap_conf.generate()
    assert file_paths is None


def test_init(
    global_config_all_json,
    input_dir,
    output_dir,
):
    restmap_conf = RestMapConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    assert hasattr(restmap_conf, "endpoints")
    assert hasattr(restmap_conf, "configuration_endpoint_names")
    assert hasattr(restmap_conf, "inputs_endpoint_names")
    assert hasattr(restmap_conf, "namespace")


def test_restmap_endpoints(global_config_all_json, input_dir, output_dir):
    expected_content = "\n".join(
        [
            "[admin:splunk_ta_uccexample_configuration]",
            "match = /",
            "members = splunk_ta_uccexample_account, "
            "splunk_ta_uccexample_oauth, splunk_ta_uccexample_settings"
            "",
            "[admin:splunk_ta_uccexample_inputs]",
            "match = /",
            "members = splunk_ta_uccexample_example_input_one, "
            "splunk_ta_uccexample_example_input_two"
            "",
            "[admin_external:splunk_ta_uccexample_oauth]",
            "handlertype = python",
            "python.version = python3",
            "handlerfile = splunk_ta_uccexample_rh_oauth.py",
            "handleractions = edit",
            "handlerpersistentmode = true",
            "[admin_external:splunk_ta_uccexample_account]",
            "handlertype = python",
            "python.version = python3",
            "handlerfile = splunk_ta_uccexample_rh_account.py",
            "handleractions = edit, list, remove, create",
            "handlerpersistentmode = true",
            "[admin_external:splunk_ta_uccexample_settings]",
            "handlertype = python",
            "python.version = python3",
            "handlerfile = splunk_ta_uccexample_rh_settings.py",
            "handleractions = edit, list",
            "handlerpersistentmode = true",
            "[admin_external:splunk_ta_uccexample_example_input_one]",
            "handlertype = python",
            "python.version = python3",
            "handlerfile = splunk_ta_uccexample_rh_example_input_one.py",
            "handleractions = edit, list, remove, create",
            "handlerpersistentmode = true",
            "[admin_external:splunk_ta_uccexample_example_input_two]",
            "handlertype = python",
            "python.version = python3",
            "handlerfile = splunk_ta_uccexample_rh_example_input_two.py",
            "handleractions = edit, list, remove, create",
            "handlerpersistentmode = true",
            "",
        ]
    )

    restmap_conf = RestMapConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    output = restmap_conf.generate()
    assert output is not None
    assert output[0]["file_name"] == "restmap.conf"
    assert output[0]["content"] == expected_content


def test_restmap_endpoints_with_user_defined_handlers(
    global_config_logging_with_user_defined_handlers, input_dir, output_dir
):
    expected_content = dedent(
        """
        [admin:splunk_ta_uccexample_configuration]
        match = /
        members = splunk_ta_uccexample_settings
        capability.post = list_storage_passwords
        [admin:endpoint1]
        match = /
        members = endpoint1
        capability.post = list_storage_passwords
        [admin:endpoint2]
        match = /splunk_ta_uccexample
        members = endpoint2
        [admin_external:splunk_ta_uccexample_settings]
        handlertype = python
        python.version = python3
        handlerfile = splunk_ta_uccexample_rh_settings.py
        handleractions = edit, list
        handlerpersistentmode = true
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
        handleractions = list, create, remove, edit
        handlerpersistentmode = true
        """
    ).lstrip()

    restmap_conf = RestMapConf(
        global_config_logging_with_user_defined_handlers, input_dir, output_dir
    )
    output = restmap_conf.generate()
    assert output is not None
    assert output[0]["file_name"] == "restmap.conf"
    assert output[0]["content"] == expected_content
