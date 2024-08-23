from unittest.mock import patch, MagicMock
from pytest import fixture
from splunk_add_on_ucc_framework.generators.xml_files import DashboardXml
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from tests.unit.helpers import get_testdata_file_path


@fixture
def global_config_with_dashboard():
    return GlobalConfig(get_testdata_file_path("valid_config.json"))


@fixture
def global_config_without_dashboard():
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
    "splunk_add_on_ucc_framework.data_ui_generator.generate_views_dashboard_xml",
    return_value="<xml></xml>",
)
def test_set_attributes_with_dashboard(
    mock_generate_dashboard_xml,
    global_config_with_dashboard,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    dashboard_xml = DashboardXml(
        global_config=global_config_with_dashboard,
        input_dir=input_dir,
        output_dir=output_dir,
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
    global_config_without_dashboard,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    dashboard_xml = DashboardXml(
        global_config=global_config_without_dashboard,
        input_dir=input_dir,
        output_dir=output_dir,
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
    global_config_with_dashboard,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    dashboard_xml = DashboardXml(
        global_config=global_config_with_dashboard,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    dashboard_xml.dashboard_xml_content = "<dashboard></dashboard>"
    exp_fname = "dashboard.xml"
    file_path = "output_path/dashboard.xml"
    mock_op_path.return_value = file_path

    mock_writer = MagicMock()
    with patch.object(dashboard_xml, "writer", mock_writer):
        file_paths = dashboard_xml.generate_xml()
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
    global_config_without_dashboard,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    dashboard_xml = DashboardXml(
        global_config=global_config_without_dashboard,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    mock_writer = MagicMock()
    with patch.object(dashboard_xml, "writer", mock_writer):
        file_paths = dashboard_xml.generate_xml()

        # Assert that no files are returned since no dashboard is configured
        assert file_paths is None
