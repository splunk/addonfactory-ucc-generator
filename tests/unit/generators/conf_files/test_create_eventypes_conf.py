from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import EventtypesConf


def test_set_attribute(global_config_all_json, input_dir, output_dir, ucc_dir, ta_name):
    eventtypes_conf = EventtypesConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert eventtypes_conf.alert_settings
    assert eventtypes_conf.conf_file == "eventtypes.conf"


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


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.EventtypesConf.set_template_and_render"
)
def test_generate_conf(
    mock_template,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    content = "content"
    exp_fname = "eventtypes.conf"
    template_render = MagicMock()
    template_render.render.return_value = content

    eventtypes_conf = EventtypesConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    eventtypes_conf._template = template_render
    file_paths = eventtypes_conf.generate_conf()

    assert mock_template.call_count == 1

    assert file_paths == {exp_fname: f"{output_dir}/{ta_name}/default/{exp_fname}"}


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
    file_paths = eventtypes_conf.generate_conf()
    assert file_paths is None
