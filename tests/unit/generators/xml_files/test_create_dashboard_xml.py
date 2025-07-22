from splunk_add_on_ucc_framework.generators.xml_files import DashboardXml
from tests.unit.helpers import compare_xml_content


def test_generate_views_dashboard_xml(
    global_config_all_json,
    input_dir,
    output_dir,
):
    dashboard_xml = DashboardXml(
        global_config_all_json,
        input_dir,
        output_dir,
    )

    result = dashboard_xml.generate_views_dashboard_xml("Splunk_TA_UCCExample")

    expected_result = """<?xml version="1.0" ?>
    <view isDashboard="False" template="Splunk_TA_UCCExample:/templates/base.html" type="html">
        <label>Monitoring Dashboard</label>
    </view>
    """
    diff = compare_xml_content(result, expected_result)
    assert diff == ""


def test_init_with_dashboard(
    global_config_all_json,
    input_dir,
    output_dir,
):
    dashboard_xml = DashboardXml(
        global_config_all_json,
        input_dir,
        output_dir,
    )

    assert hasattr(dashboard_xml, "dashboard_xml_content")


def test_init_without_dashboard(
    global_config_only_configuration,
    input_dir,
    output_dir,
):
    dashboard_xml = DashboardXml(
        global_config_only_configuration,
        input_dir,
        output_dir,
    )
    assert not hasattr(dashboard_xml, "dashboard_xml_content")


def test_generate_xml_with_dashboard(
    global_config_all_json,
    input_dir,
    output_dir,
):
    dashboard_xml = DashboardXml(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    ta_name = global_config_all_json.product
    exp_fname = "dashboard.xml"
    expected_content = f"""<?xml version="1.0" ?>
        <view isDashboard="False" template="{ta_name}:/templates/base.html" type="html">
            <label>Monitoring Dashboard</label>
        </view>
        """

    output = dashboard_xml.generate()
    assert output is not None
    diff = compare_xml_content(output[0]["content"], expected_content)
    assert diff == ""
    assert (
        output[0]["file_path"]
        == f"{output_dir}/{ta_name}/default/data/ui/views/{exp_fname}"
    )


def test_generate_xml_without_dashboard(
    global_config_only_configuration,
    input_dir,
    output_dir,
):
    dashboard_xml = DashboardXml(
        global_config_only_configuration,
        input_dir,
        output_dir,
    )
    output = dashboard_xml.generate()

    # Assert that no files are returned since no dashboard is configured
    assert output is None
