from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.datainput import (
    DataInputEndpointBuilder,
)
from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.multiple_model import (
    MultipleModelEndpointBuilder,
)
from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.single_model import (
    SingleModelEndpointBuilder,
)
from splunk_add_on_ucc_framework.rest_map_conf import RestmapConf


def test_rest_conf_build():
    endpoints = [
        SingleModelEndpointBuilder("account", "addon_name"),
        MultipleModelEndpointBuilder("settings", "addon_name"),
        DataInputEndpointBuilder("input_name", "addon_name", "input_name"),
    ]

    expected_result = """
[admin:addon_name]
match = /
members = addon_name_account, addon_name_settings, addon_name_input_name

[admin_external:addon_name_account]
handlertype = python
python.version = python3
handlerfile = addon_name_rh_account.py
handleractions = edit, list, remove, create
handlerpersistentmode = true

[admin_external:addon_name_settings]
handlertype = python
python.version = python3
handlerfile = addon_name_rh_settings.py
handleractions = edit, list
handlerpersistentmode = true

[admin_external:addon_name_input_name]
handlertype = python
python.version = python3
handlerfile = addon_name_rh_input_name.py
handleractions = edit, list, remove, create
handlerpersistentmode = true
"""

    result = RestmapConf.build(endpoints, "addon_name")

    assert expected_result == result
