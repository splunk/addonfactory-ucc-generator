from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import TagsConf


def test_set_attribute(global_config_all_json, input_dir, output_dir, ucc_dir, ta_name):
    tags_conf = TagsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert tags_conf.alert_settings
    assert tags_conf.conf_file == "tags.conf"


def test_set_attribute_without_alerts(
    global_config_for_conf_only_TA, input_dir, output_dir, ucc_dir, ta_name
):
    tags_conf = TagsConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert tags_conf.alert_settings == []
    assert tags_conf.conf_file == "tags.conf"


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.TagsConf.set_template_and_render"
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
    exp_fname = "tags.conf"
    template_render = MagicMock()
    template_render.render.return_value = content

    tags_conf = TagsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    tags_conf._template = template_render
    file_paths = tags_conf.generate_conf()

    assert mock_template.call_count == 1

    assert file_paths == {exp_fname: f"{output_dir}/{ta_name}/default/{exp_fname}"}


def test_generate_conf_no_alert_settings(
    global_config_only_configuration, input_dir, output_dir, ucc_dir, ta_name
):
    tags_conf = TagsConf(
        global_config_only_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    file_paths = tags_conf.generate_conf()
    assert file_paths is None
