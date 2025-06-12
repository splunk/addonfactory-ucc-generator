import shutil
from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import AlertActionsConf
from textwrap import dedent
import os.path
from splunk_add_on_ucc_framework import __file__ as ucc_framework_file

UCC_DIR = os.path.dirname(ucc_framework_file)


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


@patch.object(shutil, "copy")
def test_generate_conf(
    mock_copy,
    global_config_for_alerts,
    input_dir,
    output_dir,
    ta_name,
):
    exp_fname = "alert_actions.conf"
    expected_content = (
        "\n".join(
            [
                "[test_alert_active]",
                "icon_path = alerticon.png",
                "label = Test Alert Active",
                "description = Description for test Alert Action",
                (
                    "activeResponse = {'task': ['Create'], 'subject': ['endpoint'], "
                    "'category': ['Information Portrayal'], 'technology': [{'version': "
                    "['1.0.0'], 'product': 'Test Incident Update', 'vendor': 'Splunk'}], "
                    "'sourcetype': 'test:incident', 'supports_adhoc': True, 'drilldown_uri': "
                    "'search?q=search%20index%3D\"_internal\"&earliest=0&latest='}"
                ),
                "param.name = xyz",
                "python.version = python3",
                "is_custom = 1",
                "payload_format = json",
                "[test_alert_adaptive]",
                "icon_path = alerticon.png",
                "label = Test Alert Adaptive",
                "description = Description for test Alert Action",
                (
                    'param._cam = {"task": ["Create"], "subject": ["endpoint"], '
                    '"category": ["Information Portrayal"], "technology": [{"version": '
                    '["1.0.0"], "product": "Test Incident Update", "vendor": "Splunk"}], '
                    '"supports_adhoc": true, "supports_cloud": true, '
                    '"drilldown_uri": "search?q=search%20index%3D\\"_internal\\"&earliest=0&latest="}'
                ),
                "param.name = xyz",
                "python.version = python3",
                "is_custom = 1",
                "payload_format = json",
                "[test_alert_default]",
                "icon_path = alerticon.png",
                "label = Test Alert Default",
                "description = Description for test Alert Action",
                (
                    'param._cam = {"task": ["Create"], "subject": ["endpoint"], '
                    '"category": ["Information Portrayal"], "technology": [{"version": '
                    '["1.0.0"], "product": "Test Incident Update", "vendor": "Splunk"}], '
                    '"drilldown_uri": "search?q=search%20index%3D\\"_internal\\"&earliest=0&latest="}'
                ),
                "param.name = xyz",
                "python.version = python3",
                "is_custom = 1",
                "payload_format = json",
                "[test_alert_no_support]",
                "icon_path = alerticon.png",
                "label = Test Alert No Support",
                "description = Description for test Alert Action",
                (
                    "activeResponse = {'task': ['Create'], 'subject': ['endpoint'], "
                    "'category': ['Information Portrayal'], 'technology': [{'version': "
                    "['1.0.0'], 'product': 'Test Incident Update', 'vendor': 'Splunk'}], "
                    "'sourcetype': 'test:incident', 'drilldown_uri': "
                    "'search?q=search%20index%3D\"_internal\"&earliest=0&latest='}"
                ),
                "param.name = xyz",
                "python.version = python3",
                "is_custom = 1",
                "payload_format = json",
            ]
        )
        + "\n"
    )

    alert_actions_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=UCC_DIR,
        addon_name=ta_name,
    )

    output = alert_actions_conf.generate_conf()

    assert output == {
        "file_name": exp_fname,
        "file_path": f"{output_dir}/{ta_name}/default/{exp_fname}",
        "content": expected_content,
    }


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
    assert result == {}


@patch.object(shutil, "copy")
def test_generate_conf_spec(
    mock_copy,
    global_config_for_alerts,
    input_dir,
    output_dir,
    ta_name,
):
    exp_fname = "alert_actions.conf.spec"

    alert_actions_conf = AlertActionsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=UCC_DIR,
        addon_name=ta_name,
    )
    expected_content = dedent(
        """
[test_alert_active]
param.name = <string> Name. It's a required parameter. It's default value is xyz.
[test_alert_adaptive]
param._cam = <json> Adaptive Response parameters.
param.name = <string> Name. It's a required parameter. It's default value is xyz.
[test_alert_default]
param._cam = <json> Adaptive Response parameters.
param.name = <string> Name. It's a required parameter. It's default value is xyz.
[test_alert_no_support]
param.name = <string> Name. It's a required parameter. It's default value is xyz.
"""
    ).lstrip()
    output = alert_actions_conf.generate_conf_spec()

    # Ensure the appropriate methods were called and the file was generated
    assert output == {
        "file_name": exp_fname,
        "file_path": f"{output_dir}/{ta_name}/README/{exp_fname}",
        "content": expected_content,
    }


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
    assert result == {}
