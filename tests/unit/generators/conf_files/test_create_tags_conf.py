from splunk_add_on_ucc_framework.generators.conf_files import TagsConf
from textwrap import dedent


def test_init(
    global_config_all_json,
    input_dir,
    output_dir,
):
    tags_conf = TagsConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    assert tags_conf.alert_settings
    assert tags_conf.conf_file == "tags.conf"


def test_generate_conf(
    global_config_for_alerts,
    input_dir,
    output_dir,
):
    ta_name = global_config_for_alerts.product
    exp_fname = "tags.conf"

    tags_conf = TagsConf(
        global_config_for_alerts,
        input_dir,
        output_dir,
    )
    output = tags_conf.generate()
    expected_content = dedent(
        """
        [eventtype=test_alert_adaptive_modaction_result]
        modaction_result = enabled
        [eventtype=test_alert_default_modaction_result]
        modaction_result = enabled
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
    global_config_only_logging, input_dir, output_dir
):
    tags_conf = TagsConf(
        global_config_only_logging,
        input_dir,
        output_dir,
    )

    output = tags_conf.generate()
    assert output is None
