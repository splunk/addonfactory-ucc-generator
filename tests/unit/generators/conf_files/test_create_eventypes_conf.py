from splunk_add_on_ucc_framework.generators.conf_files import EventtypesConf
import os.path
from textwrap import dedent
from splunk_add_on_ucc_framework import __file__ as ucc_framework_file

UCC_DIR = os.path.dirname(ucc_framework_file)


def test_set_attribute_without_alerts(
    global_config_for_conf_only_TA, input_dir, output_dir, ucc_dir, ta_name
):
    eventtypes_conf = EventtypesConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert eventtypes_conf.alert_settings == []
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
    file_paths = eventtypes_conf.generate()

    assert file_paths == {exp_fname: f"{output_dir}/{ta_name}/default/{exp_fname}"}

    with open(file_paths["eventtypes.conf"]) as fp:
        content = fp.read()

    expected_content = dedent(
        """
        [test_alert_adaptive_modaction_result]
        search = sourcetype="test:incident"

        [test_alert_default_modaction_result]
        search = sourcetype="test:incident"
        """
    ).lstrip()
    assert content == expected_content


def test_generate_conf_no_alert_settings(
    global_config_only_configuration, input_dir, output_dir, ucc_dir, ta_name
):
    eventtypes_conf = EventtypesConf(
        global_config_only_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    file_paths = eventtypes_conf.generate()
    assert file_paths == {"": ""}
