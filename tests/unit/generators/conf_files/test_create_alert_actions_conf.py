from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import AlertActionsConf
import shutil
import json


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
    this.alerts = {"test": "unit testcase"}
    this.alerts_spec = {"test2": "unit testcase2"}
    this.conf_file = "alert_actions.conf"
    this.conf_spec_file = f"{this.conf_file}.spec"


@patch.object(shutil, "copy")
def test_parameters_processing(
    mock_copy, global_config_for_alerts, input_dir, output_dir, ucc_dir, ta_name
):
    global_config_for_alerts = MagicMock()
    global_config_for_alerts.alerts = [
        {
            "short_name": "dev_alert",
            "parameters": [
                {
                    "field": "param1",
                    "default_value": "value1",
                    "format_type": "text",
                    "label": "Param 1",
                },
                {
                    "field": "param2",
                    "default_value": "value2",
                    "format_type": "checkbox",
                    "label": "Param 2",
                },
            ],
        }
    ]

    alert_action_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert "param.param1 = value1" in alert_action_conf.alerts["dev_alert"]
    assert "param.param2 = value2" in alert_action_conf.alerts["dev_alert"]


@patch.object(shutil, "copy")
def test_keys_not_in_deny_list(
    mock_copy, global_config_for_alerts, input_dir, output_dir, ucc_dir, ta_name
):
    global_config_for_alerts = MagicMock()
    global_config_for_alerts.alerts = [
        {"short_name": "dev_alert", "custom_property": "custom_value", "parameters": []}
    ]

    alert_actions_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert "custom_property = custom_value" in alert_actions_conf.alerts["dev_alert"]


@patch.object(shutil, "copy")
def test_parameters_without_default_value(
    mock_copy, global_config_for_alerts, input_dir, output_dir, ucc_dir, ta_name
):
    global_config_for_alerts = MagicMock()
    global_config_for_alerts.alerts = [
        {
            "short_name": "dev_alert",
            "parameters": [
                {"field": "action", "format_type": "text", "label": "Action"}
            ],
        }
    ]

    alert_actions_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert "param.action = " in alert_actions_conf.alerts["dev_alert"]


@patch.object(shutil, "copy")
def test_custom_icon_file_name(
    mock_copy, global_config_for_alerts, input_dir, output_dir, ucc_dir, ta_name
):
    global_config_for_alerts = MagicMock()
    global_config_for_alerts.alerts = [
        {"short_name": "dev_alert", "iconFileName": "dev_icon.png", "parameters": []}
    ]
    alert_action_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert "icon_path = dev_icon.png" in alert_action_conf.alerts["dev_alert"]
    # Ensures no file copy occurs for custom icons
    mock_copy.assert_not_called()


@patch.object(shutil, "copy")
def test_default_icon_file_name(
    mock_copy, global_config_for_alerts, input_dir, output_dir, ucc_dir, ta_name
):
    global_config_for_alerts = MagicMock()
    global_config_for_alerts.alerts = [
        {"short_name": "dev_alert", "iconFileName": "alerticon.png", "parameters": []}
    ]

    alert_action_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert "icon_path = alerticon.png" in alert_action_conf.alerts["dev_alert"]


@patch.object(shutil, "copy")
def test_adaptive_response(
    mock_copy, global_config_for_alerts, input_dir, output_dir, ucc_dir, ta_name
):
    global_config_for_alerts = MagicMock()
    global_config_for_alerts.alerts = [
        {
            "short_name": "dev_alert",
            "adaptive_response": {"key1": "value1", "sourcetype": "", "key2": "value2"},
            "parameters": [],
        }
    ]

    alert_action_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    expected_json = json.dumps({"key1": "value1", "key2": "value2"})
    assert f"param._cam = {expected_json}" in alert_action_conf.alerts["dev_alert"]


def test_set_attributes_global_config_none(input_dir, output_dir, ucc_dir, ta_name):
    """Test _set_attributes when _global_config is None."""
    alert_action_conf = AlertActionsConf(
        global_config=None,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert not hasattr(alert_action_conf, "alerts")
    assert not hasattr(alert_action_conf, "alerts_spec")


@patch("splunk_add_on_ucc_framework.commands.modular_alert_builder.normalize")
def test_set_attributes_global_config_with_empty_alerts(
    mock_normalize, global_config_for_alerts, input_dir, output_dir, ucc_dir, ta_name
):
    global_config_for_alerts = MagicMock()
    global_config_for_alerts.alerts = []
    mock_normalize.normalize.return_value = {"schema.content": {"modular_alerts": []}}

    alert_action_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert alert_action_conf._alert_settings == []
    assert alert_action_conf.alerts == {}
    assert alert_action_conf.alerts_spec == {}


@patch.object(AlertActionsConf, "_set_attributes", mocked__set_attribute)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.AlertActionsConf.set_template_and_render"
)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.AlertActionsConf.get_file_output_path"
)
def test_generate_conf(
    mock_op_path,
    mock_template,
    global_config_for_alerts,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    content = "content"
    exp_fname = "alert_actions.conf"
    file_path = "output_path/alert_actions.conf"
    mock_op_path.return_value = file_path
    template_render = MagicMock()
    template_render.render.return_value = content

    alert_actions_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    alert_actions_conf.writer = MagicMock()
    alert_actions_conf._template = template_render
    file_paths = alert_actions_conf.generate_conf()

    # Ensure the appropriate methods were called and the file was generated
    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1
    alert_actions_conf.writer.assert_called_once_with(
        file_name=exp_fname,
        file_path=file_path,
        content=content,
    )
    assert file_paths == {exp_fname: file_path}


@patch.object(AlertActionsConf, "_set_attributes", mocked__set_attribute)
def test_generate_conf_no_alerts(
    global_config_for_alerts, input_dir, output_dir, ucc_dir, ta_name
):
    alert_action_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    alert_action_conf.alerts = {}
    result = alert_action_conf.generate_conf()
    assert result is None


@patch.object(AlertActionsConf, "_set_attributes", mocked__set_attribute)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.AlertActionsConf.set_template_and_render"
)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.AlertActionsConf.get_file_output_path"
)
def test_generate_conf_spec(
    mock_op_path,
    mock_template,
    global_config_for_alerts,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    content = "content"
    exp_fname = "alert_actions.conf.spec"
    file_path = "output_path/alert_actions.conf.spec"
    mock_op_path.return_value = file_path
    template_render = MagicMock()
    template_render.render.return_value = content

    alert_actions_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    alert_actions_conf.writer = MagicMock()
    alert_actions_conf._template = template_render
    file_paths = alert_actions_conf.generate_conf_spec()

    # Ensure the appropriate methods were called and the file was generated
    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1
    alert_actions_conf.writer.assert_called_once_with(
        file_name=exp_fname,
        file_path=file_path,
        content=content,
    )
    assert file_paths == {exp_fname: file_path}


@patch.object(AlertActionsConf, "_set_attributes", mocked__set_attribute)
def test_generate_conf_no_alerts_spec(
    global_config_for_alerts, input_dir, output_dir, ucc_dir, ta_name
):
    alert_action_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    alert_action_conf.alerts_spec = {}
    result = alert_action_conf.generate_conf_spec()
    assert result is None
