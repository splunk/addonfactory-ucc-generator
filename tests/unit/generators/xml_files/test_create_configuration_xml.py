from splunk_add_on_ucc_framework.generators.xml_files import ConfigurationXml
from textwrap import dedent


def test_set_attributes(global_config_all_json, input_dir, output_dir):
    config_xml = ConfigurationXml(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    assert hasattr(config_xml, "configuration_xml_content")


def test_set_attributes_without_configuration(
    global_config_no_configuration,
    input_dir,
    output_dir,
):
    config_xml = ConfigurationXml(
        global_config_no_configuration,
        input_dir,
        output_dir,
    )
    assert not hasattr(config_xml, "configuration_xml_content")


def test_generate_xml_without_configuration(
    global_config_no_configuration,
    input_dir,
    output_dir,
):
    configuration_xml = ConfigurationXml(
        global_config_no_configuration,
        input_dir,
        output_dir,
    )

    output = configuration_xml.generate()
    assert output == [{}]


def test_generate_xml(
    global_config_all_json,
    input_dir,
    output_dir,
):
    config_xml = ConfigurationXml(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    ta_name = global_config_all_json.product
    exp_fname = "configuration.xml"
    expected_content = dedent(
        f"""<?xml version="1.0" ?>
<view isDashboard="False" template="{ta_name}:/templates/base.html" type="html">
    <label>Configuration</label>
</view>
    """
    )

    output = config_xml.generate()

    assert output == [
        {
            "file_name": exp_fname,
            "file_path": f"{output_dir}/{ta_name}/default/data/ui/views/{exp_fname}",
            "content": expected_content,
        }
    ]
