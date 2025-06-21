from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import EventtypesConf


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
    assert eventtypes_conf.alert_settings
    assert eventtypes_conf.conf_file == "eventtypes.conf"


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.EventtypesConf.set_template_and_render"
)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.EventtypesConf.get_file_output_path"
)
def test_generate_conf(
    mock_op_path,
    mock_template,
    global_config_all_json,
    input_dir,
    output_dir,
):
    content = "content"
    exp_fname = "eventtypes.conf"
    file_path = "output_path/eventtypes.conf"
    mock_op_path.return_value = file_path
    template_render = MagicMock()
    template_render.render.return_value = content

    eventtypes_conf = EventtypesConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )

    eventtypes_conf.writer = MagicMock()
    eventtypes_conf._template = template_render
    file_paths = eventtypes_conf.generate()

    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1

    # Ensure the writer function was called with the correct parameters
    eventtypes_conf.writer.assert_called_once_with(
        file_name=exp_fname,
        file_path=file_path,
        content=content,
    )

    assert file_paths == {exp_fname: file_path}


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.EventtypesConf._set_attributes",
    return_value=MagicMock(),
)
def test_generate_conf_no_alert_settings(
    global_config_all_json,
    input_dir,
    output_dir,
):
    eventtypes_conf = EventtypesConf(
        global_config_all_json,
        input_dir,
        output_dir,
    )

    eventtypes_conf.alert_settings = {}
    file_paths = eventtypes_conf.generate()
    assert file_paths == {}
