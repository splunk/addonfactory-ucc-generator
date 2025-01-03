from pytest import fixture
from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.xml_files import ConfigurationXml
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from tests.unit.helpers import get_testdata_file_path


@fixture
def global_config():
    return GlobalConfig(get_testdata_file_path("valid_config.json"))


@fixture
def global_config_without_configuration():
    return GlobalConfig(get_testdata_file_path("valid_config_no_configuration.json"))


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
    "splunk_add_on_ucc_framework.data_ui_generator.generate_views_configuration_xml",
    return_value="<xml></xml>",
)
def test_set_attributes(
    mock_generate_xml, global_config, input_dir, output_dir, ucc_dir, ta_name
):
    config_xml = ConfigurationXml(
        global_config=global_config,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert hasattr(config_xml, "configuration_xml_content")


def test_set_attributes_without_inputs(
    global_config_without_configuration,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    config_xml = ConfigurationXml(
        global_config=global_config_without_configuration,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert not hasattr(config_xml, "configuration_xml_content")


@patch(
    "splunk_add_on_ucc_framework.generators.xml_files.ConfigurationXml._set_attributes",
    return_value=MagicMock(),
)
def test_generate_xml_without_inputs(
    mock_set_attributes,
    global_config_without_configuration,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    configuration_xml = ConfigurationXml(
        global_config=global_config_without_configuration,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    mock_writer = MagicMock()
    with patch.object(configuration_xml, "writer", mock_writer):
        file_paths = configuration_xml.generate_xml()

        # Assert that no files are returned since no dashboard is configured
        assert file_paths is None


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
    global_config,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    config_xml = ConfigurationXml(
        global_config=global_config,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    config_xml.configuration_xml_content = "<xml></xml>"
    exp_fname = "configuration.xml"
    file_path = "output_path/configuration.xml"
    mock_op_path.return_value = file_path

    mock_writer = MagicMock()
    with patch.object(config_xml, "writer", mock_writer):
        file_paths = config_xml.generate_xml()
        assert mock_op_path.call_count == 1

        mock_writer.assert_called_once_with(
            file_name=exp_fname,
            file_path=file_path,
            content=config_xml.configuration_xml_content,
        )

        assert file_paths == {exp_fname: file_path}
