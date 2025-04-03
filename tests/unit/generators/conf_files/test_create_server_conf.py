from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import ServerConf


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


@patch("os.path.isfile", return_value=False)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.ServerConf.set_template_and_render"
)
def test_generate_conf_no_existing_conf(
    mock_template,
    mock_isfile,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    content = "content"
    exp_fname = "server.conf"
    template_render = MagicMock()
    template_render.render.return_value = content

    server_conf = ServerConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    server_conf._template = template_render
    file_paths = server_conf.generate_conf()
    assert mock_template.call_count == 1

    assert file_paths == {exp_fname: f"{output_dir}/{ta_name}/default/{exp_fname}"}


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

    output = server_conf.generate_conf()
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

    file_paths = server_conf.generate_conf()
    assert file_paths is None
