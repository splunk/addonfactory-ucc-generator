from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import EventtypesConf
from splunk_add_on_ucc_framework import __file__ as ucc_framework_file
import os.path
from textwrap import dedent

UCC_DIR = os.path.dirname(ucc_framework_file)


def test_set_attribute(global_config_all_json, input_dir, output_dir, ucc_dir, ta_name):
    eventtypes_conf = EventtypesConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    eventtypes_conf._set_attributes()
    assert eventtypes_conf.alert_settings
    assert eventtypes_conf.conf_file == "eventtypes.conf"


def test_generate_conf(
    global_config_for_alerts,
    input_dir,
    output_dir,
    ta_name,
):
    exp_fname = "eventtypes.conf"

    eventtypes_conf = EventtypesConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
        ucc_dir=UCC_DIR,
        addon_name=ta_name,
    )
    output = eventtypes_conf.generate()
    expected_content = dedent(
        """
    [test_alert_adaptive_modaction_result]
    search = sourcetype="test:incident"
    [test_alert_default_modaction_result]
    search = sourcetype="test:incident"

    """
    ).lstrip()
    assert output == [
        {
            "file_name": exp_fname,
            "file_path": f"{output_dir}/{ta_name}/default/{exp_fname}",
            "content": expected_content,
        }
    ]


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.EventtypesConf._set_attributes",
    return_value=MagicMock(),
)
def test_generate_conf_no_alert_settings(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    eventtypes_conf = EventtypesConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    eventtypes_conf.alert_settings = {}
    file_paths = eventtypes_conf.generate()
    assert file_paths == [{}]
