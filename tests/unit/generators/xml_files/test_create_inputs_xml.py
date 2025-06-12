from splunk_add_on_ucc_framework.generators.xml_files import InputsXml
from textwrap import dedent


def test_set_attributes_with_inputs(
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

    assert hasattr(inputs_xml, "inputs_xml_content")


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
    expected_content = dedent(
        """<?xml version="1.0" ?>
<view isDashboard="False" template="test_addon:/templates/base.html" type="html">
    <label>Inputs</label>
</view>
    """
    )
    assert file_paths == [
        {
            "file_name": exp_fname,
            "file_path": f"{output_dir}/{ta_name}/default/data/ui/views/{exp_fname}",
            "content": expected_content,
        }
    ]


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

    # Assert that no files are returned since no dashboard is configured
    assert file_paths == [{}]
