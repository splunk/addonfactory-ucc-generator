from unittest.mock import patch
from splunk_add_on_ucc_framework.generators.xml_files import RedirectXml
from textwrap import dedent


@patch(
    "splunk_add_on_ucc_framework.data_ui_generator.generate_views_redirect_xml",
    return_value="<xml></xml>",
)
def test_set_attributes_with_oauth(
    mock_generate_redirect_xml,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    redirect_xml = RedirectXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert hasattr(redirect_xml, "redirect_xml_content")
    assert redirect_xml.ta_name == "test_addon"


@patch(
    "splunk_add_on_ucc_framework.data_ui_generator.generate_views_redirect_xml",
    return_value="<xml></xml>",
)
def test_set_attributes_without_oauth(
    mock_generate_redirect_xml,
    global_config_only_logging,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    redirect_xml = RedirectXml(
        global_config_only_logging,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert not hasattr(redirect_xml, "redirect_xml_content")


def test_generate_xml_with_oauth(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    redirect_xml = RedirectXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    exp_fname = f"{redirect_xml.ta_name}_redirect.xml"
    expected_content = dedent(
        """<?xml version="1.0" ?>
<view isDashboard="False" template="test_addon:templates/test_addon_redirect.html" type="html">
    <label>Redirect</label>
</view>
    """
    )
    file_paths = redirect_xml.generate()
    assert file_paths == [
        {
            "file_name": exp_fname,
            "file_path": f"{output_dir}/{ta_name}/default/data/ui/views/{exp_fname}",
            "content": expected_content,
        }
    ]


def test_generate_xml_without_oauth(
    global_config_only_logging,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    redirect_xml = RedirectXml(
        global_config_only_logging,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    file_paths = redirect_xml.generate()

    # Assert that no files are returned since no dashboard is configured
    assert file_paths == [{}]
