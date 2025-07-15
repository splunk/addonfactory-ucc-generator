from splunk_add_on_ucc_framework.generators.conf_files import EventtypesConf
from textwrap import dedent


def test_set_attribute(
    global_config_all_json,
    input_dir,
    output_dir,
):
    eventtypes_conf = EventtypesConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )

    eventtypes_conf._set_attributes()
    assert eventtypes_conf.conf_file == "eventtypes.conf"


def test_generate_conf(
    global_config_for_alerts,
    input_dir,
    output_dir,
):
    ta_name = global_config_for_alerts.product
    exp_fname = "eventtypes.conf"

    eventtypes_conf = EventtypesConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
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


def test_generate_conf_no_alert_settings(
    global_config_only_configuration,
    input_dir,
    output_dir,
):
    eventtypes_conf = EventtypesConf(
        global_config_only_configuration,
        input_dir,
        output_dir,
    )
    file_paths = eventtypes_conf.generate()
    assert file_paths is None
