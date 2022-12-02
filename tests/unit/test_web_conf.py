from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.datainput import (
    DataInputEndpointBuilder,
)
from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.multiple_model import (
    MultipleModelEndpointBuilder,
)
from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.single_model import (
    SingleModelEndpointBuilder,
)
from splunk_add_on_ucc_framework.web_conf import WebConf


def test_web_conf_build():
    endpoints = [
        SingleModelEndpointBuilder("account", "addon_name"),
        MultipleModelEndpointBuilder("settings", "addon_name"),
        DataInputEndpointBuilder("input_name", "addon_name", "input_name"),
    ]

    expected_result = """
[expose:addon_name_account]
pattern = addon_name_account
methods = POST, GET

[expose:addon_name_account_specified]
pattern = addon_name_account/*
methods = POST, GET, DELETE

[expose:addon_name_settings]
pattern = addon_name_settings
methods = POST, GET

[expose:addon_name_settings_specified]
pattern = addon_name_settings/*
methods = POST, GET, DELETE

[expose:addon_name_input_name]
pattern = addon_name_input_name
methods = POST, GET

[expose:addon_name_input_name_specified]
pattern = addon_name_input_name/*
methods = POST, GET, DELETE
"""
    result = WebConf.build(endpoints)

    assert expected_result == result
