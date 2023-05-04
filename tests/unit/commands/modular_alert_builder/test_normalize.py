from splunk_add_on_ucc_framework.commands.modular_alert_builder.normalize import (
    transform_params,
)


def test_normalize_type_dropdownlist_splunk_search_wo_options():
    parameter_list = [
        {
            "label": "Select Account",
            "search": "| rest /servicesNS/nobody/Splunk_TA_UCCExample/splunk_ta_uccexample_account | dedup title",
            "required": True,
            "format_type": "dropdownlist_splunk_search",
            "name": "account",
            "value-field": "title",
            "label-field": "title",
            "help_string": "Select the account from the dropdown",
        }
    ]

    transform_params(parameter_list)

    expected_result = [
        {
            "label": "Select Account",
            "required": True,
            "format_type": "dropdownlist_splunk_search",
            "name": "account",
            "help_string": "Select the account from the dropdown",
            "ctrl_props": {
                "value-field": "title",
                "label-field": "title",
                "search": "| rest /servicesNS/nobody/Splunk_TA_UCCExample/splunk_ta_uccexample_account | dedup title",
            },
        }
    ]
    assert expected_result == parameter_list


def test_normalize_type_dropdownlist_splunk_search_with_options():
    parameter_list = [
        {
            "label": "Select Account",
            "search": "| rest /servicesNS/nobody/Splunk_TA_UCCExample/splunk_ta_uccexample_account | dedup title",
            "options": {
                "items": [
                    {"label": "earliest", "value": "-4@h"},
                    {"label": "latest", "value": "now"},
                ]
            },
            "required": True,
            "format_type": "dropdownlist_splunk_search",
            "name": "account",
            "value-field": "title",
            "label-field": "title",
            "help_string": "Select the account from the dropdown",
        }
    ]

    transform_params(parameter_list)

    expected_result = [
        {
            "label": "Select Account",
            "required": True,
            "format_type": "dropdownlist_splunk_search",
            "name": "account",
            "help_string": "Select the account from the dropdown",
            "ctrl_props": {
                "value-field": "title",
                "label-field": "title",
                "search": "| rest /servicesNS/nobody/Splunk_TA_UCCExample/splunk_ta_uccexample_account | dedup title",
                "earliest": "-4@h",
                "latest": "now",
            },
        }
    ]
    assert expected_result == parameter_list


def test_normalize_type_dropdownlist_splunk_search_with_wrong_options():
    parameter_list = [
        {
            "label": "Select Account",
            "search": "| rest /servicesNS/nobody/Splunk_TA_UCCExample/splunk_ta_uccexample_account | dedup title",
            "options": {
                "items": [
                    {"label": "early", "value": "-4@h"},
                    {"label": "late", "value": "now"},
                ]
            },
            "required": True,
            "format_type": "dropdownlist_splunk_search",
            "name": "account",
            "value-field": "title",
            "label-field": "title",
            "help_string": "Select the account from the dropdown",
        }
    ]

    transform_params(parameter_list)

    expected_result = [
        {
            "label": "Select Account",
            "required": True,
            "format_type": "dropdownlist_splunk_search",
            "name": "account",
            "help_string": "Select the account from the dropdown",
            "ctrl_props": {
                "value-field": "title",
                "label-field": "title",
                "search": "| rest /servicesNS/nobody/Splunk_TA_UCCExample/splunk_ta_uccexample_account | dedup title",
            },
        }
    ]
    assert expected_result == parameter_list
