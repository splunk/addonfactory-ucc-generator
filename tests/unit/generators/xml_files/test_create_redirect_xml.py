from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.xml_files import RedirectXml
import xmldiff.main


def test_generate_views_redirect_xml(global_config_all_json, input_dir, output_dir):
    redirect_xml = RedirectXml(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    result = redirect_xml.generate_views_redirect_xml("Splunk_TA_UCCExample")

    expected_result = """<?xml version="1.0" ?>
    <view isDashboard="False" template="Splunk_TA_UCCExample:templates/splunk_ta_uccexample_redirect.html" type="html">
        <label>Redirect</label>
    </view>
    """
    diff = xmldiff.main.diff_texts(result, expected_result)

    assert " ".join([str(item) for item in diff]) == ""


def test_set_attributes_with_oauth(
    global_config_all_json, input_dir, output_dir, ta_name
):
    global_config_all_json.meta["name"] = ta_name
    redirect_xml = RedirectXml(
        global_config_all_json,
        input_dir,
        output_dir,
    )

    assert hasattr(redirect_xml, "redirect_xml_content")
    assert redirect_xml.ta_name == "test_addon"


def test_set_attributes_without_oauth(
    global_config_only_logging,
    input_dir,
    output_dir,
):
    redirect_xml = RedirectXml(
        global_config_only_logging,
        input_dir,
        output_dir,
    )

    assert not hasattr(redirect_xml, "redirect_xml_content")


@patch(
    "splunk_add_on_ucc_framework.generators.xml_files.RedirectXml.get_file_output_path"
)
def test_generate_xml_with_oauth(
    mock_op_path,
    global_config_all_json,
    input_dir,
    output_dir,
):
    redirect_xml = RedirectXml(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    redirect_xml.redirect_xml_content = "<xml></xml>"
    exp_fname = f"{redirect_xml.ta_name}_redirect.xml"
    file_path = "output_path/ta_name_redirect.xml"
    mock_op_path.return_value = file_path

    mock_writer = MagicMock()
    with patch.object(redirect_xml, "writer", mock_writer):
        file_paths = redirect_xml.generate()

        # Assert that the writer function was called with the correct parameters
        mock_writer.assert_called_once_with(
            file_name=exp_fname,
            file_path=file_path,
            content=redirect_xml.redirect_xml_content,
        )
        assert file_paths == {exp_fname: file_path}


@patch(
    "splunk_add_on_ucc_framework.generators.xml_files.RedirectXml._set_attributes",
    return_value=MagicMock(),
)
def test_generate_xml_without_oauth(
    mock_set_attributes,
    global_config_only_logging,
    input_dir,
    output_dir,
):
    redirect_xml = RedirectXml(
        global_config_only_logging,
        input_dir,
        output_dir,
    )

    mock_writer = MagicMock()
    with patch.object(redirect_xml, "writer", mock_writer):
        file_paths = redirect_xml.generate()

        # Assert that no files are returned since no dashboard is configured
        assert file_paths == {}
