import os

from splunk_add_on_ucc_framework.commands.modular_alert_builder import (
    alert_actions_conf_gen,
)
from tests.unit.helpers import get_testdata_file


def test_generate_alert_action(tmp_path):
    conf_gen = alert_actions_conf_gen.AlertActionsConfGeneration(
        input_setting={
            "short_name": "splunk_ta_uccexample",
            "modular_alerts": [
                {
                    "label": "Test Alert",
                    "description": "Description for test Alert Action",
                    "short_name": "test_alert",
                    "active_response": {
                        "task": ["Create", "Update"],
                        "subject": ["endpoint"],
                        "category": [
                            "Information Conveyance",
                            "Information Portrayal",
                        ],
                        "technology": [
                            {
                                "version": ["1.0.0"],
                                "product": "Test Incident Update",
                                "vendor": "Splunk",
                            }
                        ],
                        "sourcetype": "test:incident",
                        "supports_adhoc": True,
                        "drilldown_uri": 'search?q=search%20index%3D"_internal"&earliest=0&latest=',
                    },
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
                            "label": "Table List",
                            "required": False,
                            "format_type": "dropdownlist",
                            "name": "table_list",
                            "help_string": "Please select the table",
                            "default_value": "problem",
                            "possible_values": {
                                "incident": "Incident",
                                "problem": "Problem",
                            },
                        },
                        {
                            "label": "Action:",
                            "required": True,
                            "format_type": "radio",
                            "name": "action",
                            "help_string": "Select the action you want to perform",
                            "default_value": "two",
                            "possible_values": {
                                "update": "Update",
                                "delete": "Delete",
                            },
                        },
                        {
                            "label": "Select Account",
                            "required": True,
                            "format_type": "dropdownlist_splunk_search",
                            "name": "account",
                            "help_string": "Select the account from the dropdown",
                            "ctrl_props": {
                                "value-field": "title",
                                "label-field": "title",
                                "search": "| rest /servicesNS/nobody/Splunk_TA_UCCExample/splunk_ta_uccexample_account | dedup title",  # noqa: E501
                            },
                        },
                    ],
                }
            ],
        },
        package_path=tmp_path,
    )
    conf_gen.handle()

    expected_alert_actions_conf = get_testdata_file("alert_actions.conf.generated")
    with open(os.path.join(tmp_path, "default", "alert_actions.conf")) as _f:
        generated_alert_actions_conf = _f.read()
        assert expected_alert_actions_conf == generated_alert_actions_conf
    expected_alert_actions_conf_spec = get_testdata_file(
        "alert_actions.conf.spec.generated"
    )
    with open(os.path.join(tmp_path, "README", "alert_actions.conf.spec")) as _f:
        generated_alert_actions_conf_spec = _f.read()
        assert expected_alert_actions_conf_spec == generated_alert_actions_conf_spec
    expected_eventtypes_conf = get_testdata_file("eventtypes.conf.generated")
    with open(os.path.join(tmp_path, "default", "eventtypes.conf")) as _f:
        generated_eventtypes_conf = _f.read()
        assert expected_eventtypes_conf == generated_eventtypes_conf
    expected_tags_conf = get_testdata_file("tags.conf.generated")
    with open(os.path.join(tmp_path, "default", "tags.conf")) as _f:
        generated_tags_conf = _f.read()
        assert expected_tags_conf == generated_tags_conf
