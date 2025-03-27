from pytest import fixture, raises
from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.xml_files import DefaultXml


@fixture
def wrong_ta_name():
    return 123


def test_set_attribute_with_error(
    global_config_all_json, input_dir, output_dir, wrong_ta_name, ucc_dir
):
    with raises(ValueError):
        DefaultXml(
            global_config_all_json,
            input_dir,
            output_dir,
            ucc_dir=ucc_dir,
            addon_name=wrong_ta_name,
        )


@patch(
    "splunk_add_on_ucc_framework.data_ui_generator.generate_nav_default_xml",
    return_value="<xml></xml>",
)
def test_set_attribute(
    mock_data_ui_generator,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    default_xml = DefaultXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert hasattr(default_xml, "default_xml_content")


def test_set_attribute_with_no_pages(
    global_config_for_conf_only_TA, input_dir, output_dir, ucc_dir, ta_name
):
    default_xml = DefaultXml(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert not hasattr(default_xml, "default_xml_content")


@patch(
    "splunk_add_on_ucc_framework.generators.xml_files.DefaultXml._set_attributes",
    return_value=MagicMock(),
)
@patch(
    "splunk_add_on_ucc_framework.generators.xml_files.DefaultXml.get_file_output_path"
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
    config_xml = DefaultXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    config_xml.default_xml_content = "<xml></xml>"
    exp_fname = "default.xml"
    file_path = "output_path/default.xml"
    mock_op_path.return_value = file_path

    mock_writer = MagicMock()
    with patch.object(config_xml, "writer", mock_writer):
        file_paths = config_xml.generate_xml()

        mock_writer.assert_called_once_with(
            file_name=exp_fname,
            file_path=file_path,
            content=config_xml.default_xml_content,
        )
        assert file_paths == {exp_fname: file_path}
