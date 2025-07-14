from splunk_add_on_ucc_framework.generators.xml_files import ConfigurationXml
from tests.unit.helpers import compare_xml_content


def test_generate_views_configuration_xml(
    global_config_all_json, input_dir, output_dir
):
    config_xml = ConfigurationXml(
        global_config_all_json,
        input_dir,
        output_dir,
    )

    result = config_xml.generate_views_configuration_xml("Splunk_TA_UCCExample")

    expected_result = """<?xml version="1.0" ?>
    <view isDashboard="False" template="Splunk_TA_UCCExample:/templates/base.html" type="html">
        <label>Configuration</label>
    </view>
    """
    diff = compare_xml_content(result, expected_result)
    assert diff == ""


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
    expected_content = f"""<?xml version="1.0" ?>
        <view isDashboard="False" template="{ta_name}:/templates/base.html" type="html">
            <label>Configuration</label>
        </view>
        """

    output = config_xml.generate()
    diff = compare_xml_content(output[0]["content"], expected_content)
    assert diff == ""
    assert (
        output[0]["file_path"]
        == f"{output_dir}/{ta_name}/default/data/ui/views/{exp_fname}"
    )
