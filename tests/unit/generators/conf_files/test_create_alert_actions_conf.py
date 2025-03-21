from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import AlertActionsConf


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


def test_set_attributes_global_config_none(input_dir, output_dir, ucc_dir, ta_name):
    """Test _set_attributes when _global_config is None."""
    alert_action_conf = AlertActionsConf(
        global_config=None,
        input_dir=input_dir,
        output_dir=output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    alert_action_conf._set_attributes()

    assert not hasattr(alert_action_conf, "alerts")
    assert not hasattr(alert_action_conf, "alerts_spec")


def test_set_attributes_global_config_with_empty_alerts(
    global_config_for_alerts, input_dir, output_dir, ucc_dir, ta_name
):
    global_config_for_alerts = MagicMock()
    global_config_for_alerts.alerts = []

    alert_action_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    alert_action_conf._set_attributes(ucc_dir=ucc_dir)

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
