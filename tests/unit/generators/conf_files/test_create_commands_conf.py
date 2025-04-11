from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import CommandsConf  # type: ignore[attr-defined]


def test_set_attributes_without_custom_command(
    global_config_only_configuration, input_dir, output_dir, ucc_dir, ta_name
):
    commands_conf = CommandsConf(
        global_config_only_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert not hasattr(commands_conf, "command_names")


def test_set_attributes(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    commands_conf = CommandsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert commands_conf.conf_file == "commands.conf"
    assert commands_conf.command_names == ["generatetextcommand"]


def test_generate_conf_without_custom_command(
    global_config_only_configuration, input_dir, output_dir, ucc_dir, ta_name
):
    commands_conf = CommandsConf(
        global_config_only_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    file_paths = commands_conf.generate_conf()

    # Assert that no files are returned since no custom command is configured
    assert file_paths is None


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.CommandsConf.set_template_and_render"
)
def test_generate_conf(
    mock_template, global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    content = "content"
    exp_fname = "commands.conf"
    template_render = MagicMock()
    template_render.render.return_value = content

    commands_conf = CommandsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    commands_conf._template = template_render
    file_paths = commands_conf.generate_conf()

    assert mock_template.call_count == 1
    assert file_paths == {exp_fname: f"{output_dir}/{ta_name}/default/{exp_fname}"}
