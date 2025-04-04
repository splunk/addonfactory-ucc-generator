from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.html_files import AlertActionsHtml
from pytest import fixture


@fixture
def set_attr():
    return {"file_name": "file_path"}


def mocked__set_attribute(this, **kwargs):
    this._alert_settings = [
        {
            "label": "Dev Alert",
            "description": "Description for Dev Alert Action",
            "iconFileName": "dev icon.png",
            "customScript": "DevAlertLogic",
            "short_name": "dev_alert",
            "parameters": [
                {
                    "label": "Name",
                    "required": True,
                    "format_type": "text",
                    "name": "name",
                    "default_value": "xyz",
                    "help_string": "Please enter your name",
                },
                {
                    "label": "All Incidents",
                    "required": False,
                    "format_type": "checkbox",
                    "name": "all_incidents",
                    "default_value": 0,
                    "help_string": "Tick if you want to update all incidents/problems",
                },
                {
                    "label": "Action:",
                    "required": True,
                    "format_type": "radio",
                    "name": "action",
                    "help_string": "Select the action you want to perform",
                    "default_value": "update",
                    "possible_values": {"Update": "update", "Delete": "delete"},
                },
            ],
        }
    ]
    this._html_home = "_html_home"


def test_alert_html_generate_html_no_alerts(
    global_config_for_conf_only_TA,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    alert_html = AlertActionsHtml(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    output = alert_html.generate_html()
    assert output is None
    assert not hasattr(alert_html, "_alert_settings")


def test_alert_html_set_attribute_no_alerts(
    global_config_for_conf_only_TA,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    alert_html = AlertActionsHtml(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert not hasattr(alert_html, "_alert_settings")


def test_alert_html_set_attribute_with_alerts(
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    alert_html = AlertActionsHtml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert hasattr(alert_html, "_alert_settings")
    assert alert_html._alert_settings[0]["short_name"] == "test_alert"


@patch(
    "splunk_add_on_ucc_framework.generators.html_files.AlertActionsHtml.set_template_and_render"
)
def test_alert_html_generate_html_with_alerts(
    mock_template,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    html_content = """<html>
<body>
<p>This is a paragraph.</p>
<p>This is another paragraph.</p>
</body>
</html>"""
    exp_fname = "test_alert.html"
    template_render = MagicMock()
    template_render.render.return_value = html_content

    alert_html = AlertActionsHtml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    alert_html._template = template_render

    assert alert_html.generate_html() == {
        exp_fname: f"{output_dir}/{ta_name}/default/data/ui/alerts/{exp_fname}"
    }
    assert mock_template.call_count == 1
