import os

from splunk_add_on_ucc_framework import dashboard


def test_generate_dashboard_when_dashboard_does_not_exist(tmp_path):
    dashboard_content = "<content>Dashboard</content>"
    dashboard_xml_file_path = tmp_path / "dashboard.xml"

    dashboard.generate_dashboard(
        dashboard_content,
        str(dashboard_xml_file_path),
    )

    with open(dashboard_xml_file_path) as dashboard_xml_file:
        assert dashboard_content == dashboard_xml_file.read()


def test_generate_dashboard_when_dashboard_already_exists(tmp_path, caplog):
    dashboard_content = "<content>New Dashboard</content>"
    original_dashboard_xml_content = "<content>Original Dashboard</content>"
    original_dashboard_xml_file_path = tmp_path / "dashboard.xml"
    with open(original_dashboard_xml_file_path, "w") as original_dashboard_xml_file:
        original_dashboard_xml_file.write(original_dashboard_xml_content)

    dashboard.generate_dashboard(
        dashboard_content,
        str(tmp_path),
    )

    expected_log_warning_message = (
        f"dashboard.xml file already exists @ "
        f"{str(tmp_path)}, not overwriting "
        f"the existing dashboard file."
    )
    assert expected_log_warning_message in caplog.text
    with open(os.path.join(str(tmp_path), "dashboard.xml")) as dashboard_xml_file:
        assert original_dashboard_xml_content == dashboard_xml_file.read()
