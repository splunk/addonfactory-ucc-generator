from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import ServerConf
from textwrap import dedent


def test_set_attributes(
    global_config_all_json,
    input_dir,
    output_dir,
):
    server_conf = ServerConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )

    server_conf._gc_schema = MagicMock()
    server_conf._gc_schema.settings_conf_file_names = ["settings_conf"]
    server_conf._gc_schema.configs_conf_file_names = ["configs_conf"]
    server_conf._gc_schema.oauth_conf_file_names = ["oauth_conf"]

    server_conf._set_attributes()

    expected_custom_conf = ["settings_conf", "configs_conf", "oauth_conf"]
    assert server_conf.custom_conf == expected_custom_conf


def test_generate_conf_no_existing_conf(
    global_config_all_json,
    input_dir,
    output_dir,
):
    ta_name = global_config_all_json.product
    exp_fname = "server.conf"

    server_conf = ServerConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    expected_content = dedent(
        """
        [shclustering]
        conf_replication_include.splunk_ta_uccexample_settings = true
        conf_replication_include.splunk_ta_uccexample_account = true
        conf_replication_include.splunk_ta_uccexample_oauth = true
        """
    ).lstrip()
    output = server_conf.generate()

    assert output == [
        {
            "file_name": exp_fname,
            "file_path": f"{output_dir}/{ta_name}/default/{exp_fname}",
            "content": expected_content,
        }
    ]


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.create_server_conf.isfile",
    return_value=True,
)
def test_generate_conf_existing_conf(
    mock_isfile,
    global_config_all_json,
    input_dir,
    output_dir,
):
    server_conf = ServerConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )

    output = server_conf.generate()
    assert output == [{}]


def test_generate_conf_no_custom_conf(
    global_config_all_json,
    input_dir,
    output_dir,
):
    server_conf = ServerConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    server_conf.custom_conf = []

    file_paths = server_conf.generate()
    assert file_paths == [{}]
