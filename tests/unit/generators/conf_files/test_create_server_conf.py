from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import ServerConf


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


@patch("os.path.isfile", return_value=False)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.ServerConf.set_template_and_render"
)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.ServerConf.get_file_output_path"
)
def test_generate_conf_no_existing_conf(
    mock_op_path,
    mock_template,
    mock_isfile,
    global_config_all_json,
    input_dir,
    output_dir,
):
    content = "content"
    exp_fname = "server.conf"
    file_path = "output_path/server.conf"
    mock_op_path.return_value = file_path
    template_render = MagicMock()
    template_render.render.return_value = content

    server_conf = ServerConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )

    server_conf.writer = MagicMock()
    server_conf._template = template_render
    file_paths = server_conf.generate()
    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1

    server_conf.writer.assert_called_once_with(
        file_name=exp_fname,
        file_path=file_path,
        content=content,
    )

    assert file_paths == {exp_fname: file_path}


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.create_server_conf.isfile",
    return_value=True,
)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.ServerConf.get_file_output_path"
)
def test_generate_conf_existing_conf(
    mock_op_path,
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
    assert output == {}


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
    assert file_paths == {}
