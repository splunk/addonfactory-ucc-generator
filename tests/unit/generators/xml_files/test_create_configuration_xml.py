from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.xml_files import ConfigurationXml


@patch(
    "splunk_add_on_ucc_framework.data_ui_generator.generate_views_configuration_xml",
    return_value="<xml></xml>",
)
def test_set_attributes(
    mock_generate_xml, global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    config_xml = ConfigurationXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert hasattr(config_xml, "configuration_xml_content")


def test_set_attributes_without_configuration(
    global_config_no_configuration,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    config_xml = ConfigurationXml(
        global_config_no_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert not hasattr(config_xml, "configuration_xml_content")


@patch(
    "splunk_add_on_ucc_framework.generators.xml_files.ConfigurationXml._set_attributes",
    return_value=MagicMock(),
)
def test_generate_xml_without_configuration(
    mock_set_attributes,
    global_config_no_configuration,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    configuration_xml = ConfigurationXml(
        global_config_no_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    mock_writer = MagicMock()
    with patch.object(configuration_xml, "writer", mock_writer):
        file_paths = configuration_xml.generate()

        # Assert that no files are returned since no dashboard is configured
        assert file_paths == {}


@patch(
    "splunk_add_on_ucc_framework.generators.xml_files.ConfigurationXml._set_attributes",
    return_value=MagicMock(),
)
@patch(
    "splunk_add_on_ucc_framework.generators.xml_files.ConfigurationXml.get_file_output_path"
)
def test_generate_xml(
    mock_op_path,
    mock_set_attributes,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    config_xml = ConfigurationXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    config_xml.configuration_xml_content = "<xml></xml>"
    exp_fname = "configuration.xml"
    file_path = "output_path/configuration.xml"
    mock_op_path.return_value = file_path

    mock_writer = MagicMock()
    with patch.object(config_xml, "writer", mock_writer):
        file_paths = config_xml.generate()
        assert mock_op_path.call_count == 1

        mock_writer.assert_called_once_with(
            file_name=exp_fname,
            file_path=file_path,
            content=config_xml.configuration_xml_content,
        )

        assert file_paths == {exp_fname: file_path}
