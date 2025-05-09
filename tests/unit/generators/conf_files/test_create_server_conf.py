from unittest.mock import patch
from splunk_add_on_ucc_framework.generators.conf_files import ServerConf
import os.path
from textwrap import dedent
from splunk_add_on_ucc_framework import __file__ as ucc_framework_file

UCC_DIR = os.path.dirname(ucc_framework_file)


def test_set_attributes(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    server_conf = ServerConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    expected_custom_conf = [
        "splunk_ta_uccexample_settings",
        "splunk_ta_uccexample_account",
        "splunk_ta_uccexample_oauth",
    ]
    assert server_conf.custom_conf == expected_custom_conf


def test_generate_conf_no_existing_conf(
    global_config_all_json,
    input_dir,
    output_dir,
    ta_name,
):
    exp_fname = "server.conf"

    server_conf = ServerConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=UCC_DIR,
        addon_name=ta_name,
    )
    expected_content = dedent(
        """
        [shclustering]
        conf_replication_include.splunk_ta_uccexample_settings = true
        conf_replication_include.splunk_ta_uccexample_account = true
        conf_replication_include.splunk_ta_uccexample_oauth = true
        """
    ).lstrip()
    file_paths = server_conf.generate()

    with open(file_paths["server.conf"]) as fp:
        content = fp.read()

    assert file_paths == {exp_fname: f"{output_dir}/{ta_name}/default/{exp_fname}"}
    assert content == expected_content


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.create_server_conf.isfile",
    return_value=True,
)
def test_generate_conf_existing_conf(
    mock_isfile,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    server_conf = ServerConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    output = server_conf.generate()
    assert output == {"": ""}


def test_generate_conf_no_custom_conf(
    global_config_for_conf_only_TA, input_dir, output_dir, ucc_dir, ta_name
):
    server_conf = ServerConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    file_paths = server_conf.generate()
    assert file_paths == {"": ""}
