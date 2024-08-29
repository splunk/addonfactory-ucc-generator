from pytest import fixture
from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import ServerConf
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from tests.unit.helpers import get_testdata_file_path
from os.path import isfile


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

def test_set_attributes(global_config, input_dir, output_dir,ucc_dir,ta_name):
    # Create a ServerConf instance with mock attributes
    server_conf = ServerConf(global_config, input_dir, output_dir, ucc_dir=ucc_dir ,addon_name=ta_name)

    # Mock the _gc_schema attribute that contains the file names
    server_conf._gc_schema = MagicMock()
    server_conf._gc_schema.settings_conf_file_names = ["settings_conf"]
    server_conf._gc_schema.configs_conf_file_names = ["configs_conf"]
    server_conf._gc_schema.oauth_conf_file_names = ["oauth_conf"]

    server_conf._set_attributes()

    # Check that the custom_conf attribute is set correctly
    expected_custom_conf = ["settings_conf", "configs_conf", "oauth_conf"]
    assert server_conf.custom_conf == expected_custom_conf

@patch("os.path.isfile", return_value=False)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.ServerConf.set_template_and_render"
)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.ServerConf.get_file_output_path"
)
def test_generate_conf_no_existing_conf(mock_op_path, mock_template,mock_isfile, global_config, input_dir, output_dir,ucc_dir,ta_name):
    # Create a ServerConf instance
    content = "content"
    exp_fname = "server.conf"
    file_path = "output_path/server.conf"
    mock_op_path.return_value = file_path
    template_render = MagicMock()
    template_render.render.return_value = content

    # Create a ServerConf instance

    server_conf = ServerConf(global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name)

    server_conf.writer = MagicMock()
    server_conf._template = template_render
    file_paths = server_conf.generate_conf()
    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1

        # expected_file_path = server_conf.get_file_output_path(["default", "server.conf"])
        
        # Ensure the writer function was called with the correct parameters
    server_conf.writer.assert_called_once_with(
        file_name=exp_fname,
        file_path=file_path,
        content=content,
    )
    
    assert file_paths == {exp_fname: file_path}

@patch("splunk_add_on_ucc_framework.generators.conf_files.create_server_conf.isfile", return_value=True)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.ServerConf.get_file_output_path"
)
def test_generate_conf_existing_conf(mock_op_path,mock_isfile, global_config, input_dir, output_dir,ucc_dir,ta_name):
    server_conf = ServerConf(
        global_config,
        input_dir,
        output_dir,
        ucc_dir = ucc_dir, 
        addon_name=ta_name
    )

    output = server_conf.generate_conf()
    assert output == {"": ""}

def test_generate_conf_no_custom_conf(global_config, input_dir, output_dir,ucc_dir,ta_name):
    server_conf = ServerConf(global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name)
    server_conf.custom_conf = []

    file_paths = server_conf.generate_conf()
    assert file_paths is None