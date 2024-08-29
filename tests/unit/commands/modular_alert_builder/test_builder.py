import os

from splunk_add_on_ucc_framework.commands.modular_alert_builder import builder
from tests.unit.helpers import get_testdata_file


def test_builder(global_config_all_json, tmp_path):
    addon_name = "Splunk_TA_UCCExample"
    tmp_path_addon = tmp_path / addon_name
    tmp_path_addon.mkdir()
    tmp_path_addon_appserver = tmp_path_addon / "appserver"
    tmp_path_addon_appserver.mkdir()
    tmp_path_addon_appserver_static = tmp_path_addon_appserver / "static"
    tmp_path_addon_appserver_static.mkdir()

    builder.generate_alerts(
        global_config_all_json,
        "Splunk_TA_UCCExample",
        str(tmp_path),
    )
    expected_alert = get_testdata_file("alert_action.py.generated")
    with open(os.path.join(tmp_path, addon_name, "bin", "test_alert.py")) as _f:
        generated_alert = _f.read()
        assert expected_alert == generated_alert
    expected_alert_helper = get_testdata_file("alert_action_helper.py.generated")
    with open(
        os.path.join(
            tmp_path,
            addon_name,
            "bin",
            "splunk_ta_uccexample",
            "modalert_test_alert_helper.py",
        )
    ) as _f:
        generated_alert_helper = _f.read()
        assert expected_alert_helper == generated_alert_helper
