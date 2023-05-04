import os

from splunk_add_on_ucc_framework.commands.build import internal_root_dir
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
        internal_root_dir,
        str(tmp_path),
    )

    expected_alert_actions_conf = get_testdata_file("alert_actions.conf.generated")
    with open(
        os.path.join(tmp_path, addon_name, "default", "alert_actions.conf")
    ) as _f:
        generated_alert_actions_conf = _f.read()
        assert expected_alert_actions_conf == generated_alert_actions_conf
    expected_alert_actions_conf_spec = get_testdata_file(
        "alert_actions.conf.spec.generated"
    )
    with open(
        os.path.join(tmp_path, addon_name, "README", "alert_actions.conf.spec")
    ) as _f:
        generated_alert_actions_conf_spec = _f.read()
        assert expected_alert_actions_conf_spec == generated_alert_actions_conf_spec
    expected_eventtypes_conf = get_testdata_file("eventtypes.conf.generated")
    with open(os.path.join(tmp_path, addon_name, "default", "eventtypes.conf")) as _f:
        generated_eventtypes_conf = _f.read()
        assert expected_eventtypes_conf == generated_eventtypes_conf
    expected_tags_conf = get_testdata_file("tags.conf.generated")
    with open(os.path.join(tmp_path, addon_name, "default", "tags.conf")) as _f:
        generated_tags_conf = _f.read()
        assert expected_tags_conf == generated_tags_conf

    expected_alert_html = get_testdata_file("alert.html.generated")
    with open(
        os.path.join(
            tmp_path, addon_name, "default", "data", "ui", "alerts", "test_alert.html"
        )
    ) as _f:
        generated_alert_html = _f.read()
        assert expected_alert_html == generated_alert_html

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
