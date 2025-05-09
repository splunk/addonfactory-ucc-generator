from splunk_add_on_ucc_framework.generators.xml_files import RedirectXml
import os.path
import xmldiff.main

from splunk_add_on_ucc_framework import __file__ as ucc_framework_file

UCC_DIR = os.path.dirname(ucc_framework_file)


def test_set_attributes_without_oauth(
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
    global_config_all_json, input_dir, output_dir, ta_name
):
    redirect_xml = RedirectXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=UCC_DIR,
        addon_name=ta_name,
    )
    exp_fname = f"{redirect_xml.ta_name}_redirect.xml"

    file_paths = redirect_xml.generate()
    assert file_paths == {
        exp_fname: f"{output_dir}/{ta_name}/default/data/ui/views/{exp_fname}"
    }

    with open(file_paths[f"{redirect_xml.ta_name}_redirect.xml"]) as fp:
        content = fp.read()

    expected_content = """<?xml version="1.0" ?>
        <view isDashboard="False" template="test_addon:templates/test_addon_redirect.html" type="html">
            <label>Redirect</label>
        </view>
        """
    diff = xmldiff.main.diff_texts(expected_content, content)
    assert " ".join([str(item) for item in diff]) == ""


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
    assert file_paths == {"": ""}
