from splunk_add_on_ucc_framework.generators.xml_files import InputsXml
import os.path
import xmldiff.main

from splunk_add_on_ucc_framework import __file__ as ucc_framework_file

UCC_DIR = os.path.dirname(ucc_framework_file)


def test_set_attributes_without_inputs(
    global_config_only_configuration,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    inputs_xml = InputsXml(
        global_config_only_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert not hasattr(inputs_xml, "inputs_xml_content")


def test_generate_xml_with_inputs(
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    inputs_xml = InputsXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    exp_fname = "inputs.xml"

    file_paths = inputs_xml.generate()
    assert file_paths == {
        exp_fname: f"{output_dir}/{ta_name}/default/data/ui/views/{exp_fname}"
    }

    with open(file_paths["inputs.xml"]) as fp:
        content = fp.read()
    expected_content = """<?xml version="1.0" ?>
        <view isDashboard="False" template="test_addon:/templates/base.html" type="html">
            <label>Inputs</label>
        </view>
        """
    diff = xmldiff.main.diff_texts(expected_content, content)
    assert " ".join([str(item) for item in diff]) == ""


def test_generate_xml_without_inputs(
    global_config_only_configuration,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    inputs_xml = InputsXml(
        global_config_only_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    file_paths = inputs_xml.generate()
    assert file_paths == {}
