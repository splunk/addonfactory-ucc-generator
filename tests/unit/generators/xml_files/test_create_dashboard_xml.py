from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.xml_files import DashboardXml


@patch(
    "splunk_add_on_ucc_framework.data_ui_generator.generate_views_dashboard_xml",
    return_value="<xml></xml>",
)
def test_set_attributes_with_dashboard(
    mock_generate_dashboard_xml,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    dashboard_xml = DashboardXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert hasattr(dashboard_xml, "dashboard_xml_content")


@patch(
    "splunk_add_on_ucc_framework.data_ui_generator.generate_views_dashboard_xml",
    return_value="<xml></xml>",
)
def test_set_attributes_without_dashboard(
    mock_generate_dashboard_xml,
    global_config_only_configuration,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    dashboard_xml = DashboardXml(
        global_config_only_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert not hasattr(dashboard_xml, "dashboard_xml_content")


@patch(
    "splunk_add_on_ucc_framework.generators.xml_files.DashboardXml._set_attributes",
    return_value=MagicMock(),
)
@patch(
    "splunk_add_on_ucc_framework.generators.xml_files.DashboardXml.get_file_output_path"
)
def test_generate_xml_with_dashboard(
    mock_op_path,
    mock_set_attributes,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    dashboard_xml = DashboardXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    dashboard_xml.dashboard_xml_content = "<dashboard></dashboard>"
    exp_fname = "dashboard.xml"
    file_path = "output_path/dashboard.xml"
    mock_op_path.return_value = file_path

    mock_writer = MagicMock()
    with patch.object(dashboard_xml, "writer", mock_writer):
        file_paths = dashboard_xml.generate()
        assert mock_op_path.call_count == 1

        mock_writer.assert_called_once_with(
            file_name=exp_fname,
            file_path=file_path,
            content=dashboard_xml.dashboard_xml_content,
        )
        assert file_paths == {exp_fname: file_path}


@patch(
    "splunk_add_on_ucc_framework.generators.xml_files.DashboardXml._set_attributes",
    return_value=MagicMock(),
)
def test_generate_xml_without_dashboard(
    mock_set_attributes,
    global_config_only_configuration,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    dashboard_xml = DashboardXml(
        global_config_only_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    mock_writer = MagicMock()
    with patch.object(dashboard_xml, "writer", mock_writer):
        file_paths = dashboard_xml.generate()

        # Assert that no files are returned since no dashboard is configured
        assert file_paths == {}
