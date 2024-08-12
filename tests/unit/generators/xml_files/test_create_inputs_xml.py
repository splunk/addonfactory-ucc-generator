from unittest.mock import patch, MagicMock
from pytest import fixture
from splunk_add_on_ucc_framework.generators.xml_files import InputsXml
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from tests.unit.helpers import get_testdata_file_path


@fixture
def global_config_with_inputs():
    return GlobalConfig(get_testdata_file_path("valid_config.json"))


@fixture
def global_config_without_inputs():
    return GlobalConfig(get_testdata_file_path("valid_config_only_configuration.json"))


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


@patch(
    "splunk_add_on_ucc_framework.data_ui_generator.generate_views_inputs_xml",
    return_value="<xml></xml>",
)
def test_set_attributes_with_inputs(
    mock_generate_dashboard_xml,
    global_config_with_inputs,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    inputs_xml = InputsXml(
        global_config=global_config_with_inputs,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert hasattr(inputs_xml, "inputs_xml_content")


@patch(
    "splunk_add_on_ucc_framework.data_ui_generator.generate_views_inputs_xml",
    return_value="<xml></xml>",
)
def test_set_attributes_without_inputs(
    mock_generate_dashboard_xml,
    global_config_without_inputs,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    inputs_xml = InputsXml(
        global_config=global_config_without_inputs,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert not hasattr(inputs_xml, "inputs_xml_content")


@patch(
    "splunk_add_on_ucc_framework.generators.xml_files.InputsXml._set_attributes",
    return_value=MagicMock(),
)
@patch(
    "splunk_add_on_ucc_framework.generators.xml_files.InputsXml.get_file_output_path"
)
def test_generate_xml_with_inputs(
    mock_op_path,
    mock_set_attributes,
    global_config_with_inputs,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    inputs_xml = InputsXml(
        global_config=global_config_with_inputs,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    inputs_xml.inputs_xml_content = "<xml></xml>"
    exp_fname = "inputs.xml"
    file_path = "output_path/inputs.xml"
    mock_op_path.return_value = file_path

    mock_writer = MagicMock()
    with patch.object(inputs_xml, "writer", mock_writer):
        file_paths = inputs_xml.generate_xml()

        # Assert that the writer function was called with the correct parameters
        mock_writer.assert_called_once_with(
            file_name=exp_fname,
            file_path=file_path,
            content=inputs_xml.inputs_xml_content,
        )
        assert file_paths == {exp_fname: file_path}


@patch(
    "splunk_add_on_ucc_framework.generators.xml_files.InputsXml._set_attributes",
    return_value=MagicMock(),
)
def test_generate_xml_without_inputs(
    mock_set_attributes,
    global_config_without_inputs,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    inputs_xml = InputsXml(
        global_config=global_config_without_inputs,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    mock_writer = MagicMock()
    with patch.object(inputs_xml, "writer", mock_writer):
        file_paths = inputs_xml.generate_xml()

        # Assert that no files are returned since no dashboard is configured
        assert file_paths == super(InputsXml, inputs_xml).generate_xml()
