from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.xml_files import InputsXml
import xmldiff.main


def test_generate_views_inputs_xml(global_config_all_json, input_dir, output_dir):
    inputs_xml = InputsXml(global_config_all_json, input_dir, output_dir)
    result = inputs_xml.generate_views_inputs_xml("Splunk_TA_UCCExample")

    expected_result = """<?xml version="1.0" ?>
<view isDashboard="False" template="Splunk_TA_UCCExample:/templates/base.html" type="html">
    <label>Inputs</label>
</view>
"""
    diff = xmldiff.main.diff_texts(result, expected_result)

    assert " ".join([str(item) for item in diff]) == ""


def test_set_attributes_with_inputs(
    global_config_all_json,
    input_dir,
    output_dir,
):
    inputs_xml = InputsXml(
        global_config_all_json,
        input_dir,
        output_dir,
    )

    assert hasattr(inputs_xml, "inputs_xml_content")


def test_set_attributes_without_inputs(
    global_config_only_configuration,
    input_dir,
    output_dir,
):
    inputs_xml = InputsXml(
        global_config_only_configuration,
        input_dir,
        output_dir,
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
    global_config_all_json,
    input_dir,
    output_dir,
):
    inputs_xml = InputsXml(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    inputs_xml.inputs_xml_content = "<xml></xml>"
    exp_fname = "inputs.xml"
    file_path = "output_path/inputs.xml"
    mock_op_path.return_value = file_path

    mock_writer = MagicMock()
    with patch.object(inputs_xml, "writer", mock_writer):
        file_paths = inputs_xml.generate()

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
    global_config_only_configuration,
    input_dir,
    output_dir,
):
    inputs_xml = InputsXml(
        global_config_only_configuration,
        input_dir,
        output_dir,
    )

    mock_writer = MagicMock()
    with patch.object(inputs_xml, "writer", mock_writer):
        file_paths = inputs_xml.generate()

        # Assert that no files are returned since no dashboard is configured
        assert file_paths == {}
