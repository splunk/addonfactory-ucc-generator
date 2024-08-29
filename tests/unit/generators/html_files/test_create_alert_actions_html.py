from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.html_files import AlertActionsHtml
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from tests.unit.helpers import get_testdata_file_path
from pytest import fixture


@fixture
def global_config():
    return GlobalConfig(get_testdata_file_path("valid_config_all_alerts.json"))


@fixture
def global_config_no_alerts():
    return GlobalConfig(get_testdata_file_path("valid_config_only_configuration.json"))


@fixture
def input_dir(tmp_path):
    return str(tmp_path / "input_dir")


@fixture
def output_dir(tmp_path):
    return str(tmp_path / "output_dir")


@fixture
def ucc_dir(tmp_path):
    return str(tmp_path / "ucc_dir")


@fixture
def ta_name():
    return "test_addon"


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


@patch(
    "splunk_add_on_ucc_framework.generators.html_files.AlertActionsHtml._set_attributes",
    return_value=MagicMock(),
)
def test_alert_html_generate_html_no_global_config(
    mock_set_attributes,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    mocked_gc = MagicMock()
    mocked_gc.return_value = None

    alert_html = AlertActionsHtml(
        global_config=mocked_gc(),
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    output = alert_html.generate_html()
    assert output is None


@patch(
    "splunk_add_on_ucc_framework.generators.html_files.AlertActionsHtml._set_attributes",
    return_value=MagicMock(),
)
def test_alert_html_generate_html_no_alerts(
    mock_set_attributes,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    mocked_gc = MagicMock()
    mocked_gc.has_alerts.return_value = False

    alert_html = AlertActionsHtml(
        global_config=mocked_gc,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    output = alert_html.generate_html()
    assert output is None
    assert not hasattr(alert_html, "_alert_settings")


@patch.object(AlertActionsHtml, "_set_attributes", mocked__set_attribute)
@patch(
    "splunk_add_on_ucc_framework.generators.html_files.AlertActionsHtml.set_template_and_render"
)
@patch(
    "splunk_add_on_ucc_framework.generators.html_files.AlertActionsHtml.get_file_output_path"
)
def test_alert_html_generate_html_with_alerts(
    mock_op_path, mock_template, global_config, input_dir, output_dir, ucc_dir, ta_name
):
    html_content = """<html>
<body>
<p>This is a paragraph.</p>
<p>This is another paragraph.</p>
</body>
</html>"""
    exp_fname = "dev_alert.html"
    file_path = "output_path/alert_html.html"
    mock_op_path.return_value = file_path
    template_render = MagicMock()
    template_render.render.return_value = html_content

    alert_html = AlertActionsHtml(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    print("\n \n")
    print(alert_html._alert_settings)
    alert_html.writer = MagicMock()
    alert_html._template = template_render

    assert alert_html.generate_html() == {exp_fname: file_path}
    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1
    alert_html.writer.assert_called_once_with(
        file_name=exp_fname, file_path=file_path, content=html_content
    )


@patch(
    "splunk_add_on_ucc_framework.generators.html_files.AlertActionsHtml.set_template_and_render"
)
@patch(
    "splunk_add_on_ucc_framework.generators.html_files.AlertActionsHtml.get_file_output_path"
)
def test_alert_actions_html_set_attributes_and_generate(
    mock_op_path, mock_template, global_config, input_dir, output_dir, ucc_dir, ta_name
):
    html_content = """<html>
<body>
<p>This is a paragraph.</p>
<p>This is another paragraph.</p>
</body>
</html>"""
    file_path = "output_path/alert_html.html"
    mock_op_path.return_value = file_path
    template_render = MagicMock()
    template_render.render.return_value = html_content

    alert_html = AlertActionsHtml(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    assert hasattr(alert_html, "_alert_settings")
    alert_html.writer = MagicMock()
    alert_html._template = template_render
    output = alert_html.generate_html()

    assert output is not None
    assert len(output) == 4, "4 alert action html file path should be provided"
    assert mock_op_path.call_count == 4
    assert mock_template.call_count == 4
