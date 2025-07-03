from splunk_add_on_ucc_framework.generators.xml_files import DashboardXml
from textwrap import dedent


def test_set_attributes_with_dashboard(
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


def test_set_attributes_without_dashboard(
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
    expected_content = dedent(
        f"""<?xml version="1.0" ?>
<view isDashboard="False" template="{ta_name}:/templates/base.html" type="html">
    <label>Monitoring Dashboard</label>
</view>
    """
    )

    output = dashboard_xml.generate()
    assert output == [
        {
            "file_name": exp_fname,
            "file_path": f"{output_dir}/{ta_name}/default/data/ui/views/{exp_fname}",
            "content": expected_content,
        }
    ]


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
    assert output == [{}]
