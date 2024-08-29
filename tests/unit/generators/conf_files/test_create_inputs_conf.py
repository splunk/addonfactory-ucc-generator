from pytest import fixture
from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import InputsConf
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

def test_set_attributes_no_global_config(global_config, input_dir, output_dir,ucc_dir,ta_name):
        """Test when _global_config is None."""
        inputs_conf = InputsConf(global_config, input_dir, output_dir,ucc_dir = ucc_dir, addon_name=ta_name)
        inputs_conf._global_config = None

        inputs_conf._set_attributes()

        assert inputs_conf.input_names == []

def test_set_attributes_no_inputs_in_global_config(global_config, input_dir, output_dir,ucc_dir,ta_name):
        """Test when _global_config is provided but has no inputs."""
        inputs_conf = InputsConf(global_config, input_dir, output_dir,ucc_dir = ucc_dir, addon_name=ta_name)
        inputs_conf._global_config = MagicMock()
        inputs_conf._global_config.inputs = []

        inputs_conf._set_attributes()

        assert inputs_conf.input_names == []

def test_set_attributes_with_conf_key(global_config, input_dir, output_dir,ucc_dir,ta_name):
        """Test when a service has a 'conf' key."""
        inputs_conf = InputsConf(global_config, input_dir, output_dir,ucc_dir = ucc_dir, addon_name=ta_name)
        inputs_conf._global_config = MagicMock()
        inputs_conf._global_config.inputs = [
            {"name": "service1", "conf": "some_conf"}
        ]

        inputs_conf._set_attributes()

        expected_output = [{"service1": ["placeholder = placeholder"]}]
        assert inputs_conf.input_names == expected_output
        assert inputs_conf.conf_file == "inputs.conf"
        assert inputs_conf.conf_spec_file == "inputs.conf.spec"

def test_set_attributes_without_conf_key_and_name_field(global_config, input_dir, output_dir,ucc_dir,ta_name):
        """Test when a service does not have 'conf' key and 'entity' contains 'name' field."""
        inputs_conf = InputsConf(global_config, input_dir, output_dir,ucc_dir = ucc_dir, addon_name=ta_name)
        inputs_conf._global_config = MagicMock()
        inputs_conf._global_config.inputs = [
            {"name": "service1", "entity": [{"field": "name"}]}
        ]

        inputs_conf._set_attributes()

        expected_output = [{"service1": []}]
        assert inputs_conf.input_names == expected_output

def test_set_attributes_without_conf_key_and_other_fields(global_config, input_dir, output_dir,ucc_dir,ta_name):
        """Test when a service does not have 'conf' key and 'entity' contains fields other than 'name'."""
        inputs_conf = InputsConf(global_config, input_dir, output_dir,ucc_dir = ucc_dir, addon_name=ta_name)
        inputs_conf._global_config = MagicMock()
        inputs_conf._global_config.inputs = [
            {
                "name": "service1",
                "entity": [
                    {"field": "other_field", "help": "help text", "defaultValue": "default_val"}
                ]
            }
        ]

        inputs_conf._set_attributes()

        expected_output = [{"service1": ["other_field = help text  Default: default_val"]}]
        assert inputs_conf.input_names == expected_output

@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.InputsConf.set_template_and_render"
)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.InputsConf.get_file_output_path"
)
def test_generate_conf(mock_op_path, mock_template, global_config, input_dir, output_dir,ucc_dir,ta_name):
    # Mock returned values
    content = "content"
    exp_fname = "inputs.conf"
    file_path = "output_path/inputs.conf"
    mock_op_path.return_value = file_path
    template_render = MagicMock()
    template_render.render.return_value = content

    inputs_conf = InputsConf(global_config, input_dir, output_dir, ucc_dir = ucc_dir, addon_name=ta_name)
    inputs_conf.writer = MagicMock()
    inputs_conf._template = template_render
    file_paths = inputs_conf.generate_conf()

    # Ensure the appropriate methods were called and the file was generated
    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1
    inputs_conf.writer.assert_called_once_with(
        file_name=exp_fname,
        file_path=file_path,
        content=content,
    )
    assert file_paths == {exp_fname: file_path}


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.InputsConf._set_attributes",
    return_value=MagicMock(),
)
def test_generate_conf_no_input_names(global_config, input_dir, output_dir,ucc_dir,ta_name):
    inputs_conf = InputsConf(global_config, input_dir, output_dir,ucc_dir = ucc_dir ,addon_name=ta_name)
    inputs_conf.input_names = []
    result = inputs_conf.generate_conf()
    result is None


@patch("splunk_add_on_ucc_framework.generators.conf_files.InputsConf.set_template_and_render")
@patch("splunk_add_on_ucc_framework.generators.conf_files.InputsConf.get_file_output_path")
def test_generate_conf_spec(mock_op_path, mock_template, global_config, input_dir, output_dir,ucc_dir,ta_name):
    # Mock returned values
    content = "content"
    exp_fname = "inputs.conf.spec"
    file_path = "output_path/inputs.conf.spec"
    mock_op_path.return_value = file_path
    mock_template_render = MagicMock()
    mock_template_render.render.return_value = content

    inputs_conf = InputsConf(global_config, input_dir, output_dir, ucc_dir = ucc_dir, addon_name=ta_name)
    inputs_conf.writer = MagicMock()
    inputs_conf._template = mock_template_render

    file_paths = inputs_conf.generate_conf_spec()

    # Ensure the appropriate methods were called and the file was generated
    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1
    inputs_conf.writer.assert_called_once_with(
        file_name=exp_fname,
        file_path=file_path,
        content=content,
    )
    assert file_paths == {exp_fname: file_path}

@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.InputsConf._set_attributes",
    return_value=MagicMock(),
)
def test_generate_conf_no_input_names(global_config, input_dir, output_dir,ucc_dir,ta_name):
    inputs_conf = InputsConf(global_config, input_dir, output_dir,ucc_dir = ucc_dir ,addon_name=ta_name)
    inputs_conf.input_names = []
    result = inputs_conf.generate_conf_spec()
    result is None

