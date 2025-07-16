import shutil
from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import AlertActionsConf
from textwrap import dedent


def test_set_attributes_global_config_with_empty_alerts(
    global_config_for_alerts,
    input_dir,
    output_dir,
):
    global_config_for_alerts = MagicMock()
    global_config_for_alerts.alerts = []

    alert_action_conf = AlertActionsConf(
        global_config_for_alerts, input_dir, output_dir
    )
    alert_action_conf._set_attributes()

    assert alert_action_conf.alerts == {}
    assert alert_action_conf.alerts_spec == {}


@patch.object(shutil, "copy")
def test_generate_conf(mock_copy, global_config_for_alerts, input_dir, output_dir):
    ta_name = global_config_for_alerts.product
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
        global_config_for_alerts, input_dir, output_dir
    )

    output = alert_actions_conf.generate_conf()

    assert output == {
        "file_name": exp_fname,
        "file_path": f"{output_dir}/{ta_name}/default/{exp_fname}",
        "content": expected_content,
    }


def test_generate_alerts_no_alerts(
    global_config_only_configuration, input_dir, output_dir
):
    alert_action_conf = AlertActionsConf(
        global_config_only_configuration, input_dir, output_dir
    )
    result = alert_action_conf.generate()
    assert alert_action_conf.generate_conf() is None
    assert alert_action_conf.generate_conf_spec() is None
    assert result is None


@patch.object(shutil, "copy")
def test_generate_conf_spec(mock_copy, global_config_for_alerts, input_dir, output_dir):
    ta_name = global_config_for_alerts.product
    exp_fname = "alert_actions.conf.spec"

    alert_actions_conf = AlertActionsConf(
        global_config_for_alerts, input_dir, output_dir
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
