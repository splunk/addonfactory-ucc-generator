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
    alert_action_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert "param.name = xyz" in alert_action_conf.alerts["test_alert_no_support"]


@patch.object(shutil, "copy")
def test_keys_not_in_deny_list(
    mock_copy, global_config_for_alerts, input_dir, output_dir, ucc_dir, ta_name
):
    alert_actions_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert (
        "custom_property = custom_value"
        in alert_actions_conf.alerts["test_alert_default"]
    )


@patch.object(shutil, "copy")
def test_parameters_without_default_value(
    mock_copy, global_config_for_alerts, input_dir, output_dir, ucc_dir, ta_name
):
    alert_action_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert "param.name = " in alert_action_conf.alerts["test_alert_active"]


@patch.object(shutil, "copy")
def test_custom_icon_file_name(
    mock_copy, global_config_for_alerts, input_dir, output_dir, ucc_dir, ta_name
):
    alert_action_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert "icon_path = dev_icon.png" in alert_action_conf.alerts["test_alert_default"]


@patch.object(shutil, "copy")
def test_default_icon_file_name(
    mock_copy, global_config_for_alerts, input_dir, output_dir, ucc_dir, ta_name
):
    alert_action_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert "icon_path = alerticon.png" in alert_action_conf.alerts["test_alert_active"]


@patch.object(shutil, "copy")
def test_adaptive_response(
    mock_copy, global_config_for_alerts, input_dir, output_dir, ucc_dir, ta_name
):
    alert_action_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    expected_json = json.dumps(
        {
            "task": ["Create"],
            "subject": ["endpoint"],
            "category": ["Information Portrayal"],
            "technology": [
                {
                    "version": ["1.0.0"],
                    "product": "Test Incident Update",
                    "vendor": "Splunk",
                }
            ],
            "supports_adhoc": True,
            "supports_cloud": True,
            "drilldown_uri": 'search?q=search%20index%3D"_internal"&earliest=0&latest=',
        }
    )

    assert (
        f"param._cam = {expected_json}"
        in alert_action_conf.alerts["test_alert_adaptive"]
    )


def test_set_attributes_global_config_with_empty_alerts(
    global_config_only_configuration, input_dir, output_dir, ucc_dir, ta_name
):
    alert_action_conf = AlertActionsConf(
        global_config_only_configuration,
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
def test_generate_conf(
    mock_template,
    global_config_for_alerts,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    content = "content"
    exp_fname = "alert_actions.conf"
    template_render = MagicMock()
    template_render.render.return_value = content

    alert_actions_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    alert_actions_conf._template = template_render
    file_paths = alert_actions_conf.generate_conf()
    assert mock_template.call_count == 1
    assert file_paths == {exp_fname: f"{output_dir}/{ta_name}/default/{exp_fname}"}


def test_generate_conf_no_alerts(
    global_config_only_configuration, input_dir, output_dir, ucc_dir, ta_name
):
    alert_action_conf = AlertActionsConf(
        global_config_only_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    result = alert_action_conf.generate_conf()
    assert result is None


@patch.object(AlertActionsConf, "_set_attributes", mocked__set_attribute)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.AlertActionsConf.set_template_and_render"
)
def test_generate_conf_spec(
    mock_template,
    global_config_for_alerts,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    content = "content"
    exp_fname = "alert_actions.conf.spec"
    template_render = MagicMock()
    template_render.render.return_value = content

    alert_actions_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    alert_actions_conf._template = template_render
    file_paths = alert_actions_conf.generate_conf_spec()

    # Ensure the appropriate methods were called and the file was generated
    assert mock_template.call_count == 1
    assert file_paths == {exp_fname: f"{output_dir}/{ta_name}/README/{exp_fname}"}


def test_generate_conf_no_alerts_spec(
    global_config_only_configuration, input_dir, output_dir, ucc_dir, ta_name
):
    alert_action_conf = AlertActionsConf(
        global_config_only_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    result = alert_action_conf.generate_conf_spec()
    assert result is None
