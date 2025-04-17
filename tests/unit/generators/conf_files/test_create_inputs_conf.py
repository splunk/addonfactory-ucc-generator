import json
import os
from pathlib import Path
from textwrap import dedent
from unittest.mock import patch, MagicMock

from splunk_add_on_ucc_framework import __file__ as ucc_framework_file
from splunk_add_on_ucc_framework.generators.conf_files import InputsConf
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from tests.unit.helpers import get_testdata_file_path


UCC_DIR = os.path.dirname(ucc_framework_file)


def test_set_attributes_no_inputs_in_global_config(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    """Test when _global_config is provided but has no inputs."""
    inputs_conf = InputsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    inputs_conf._global_config = MagicMock()
    inputs_conf._global_config.inputs = []

    inputs_conf._set_attributes()

    assert not inputs_conf.generate_conf()
    assert not inputs_conf.generate_conf_spec()


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.InputsConf.set_template_and_render"
)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.InputsConf.get_file_output_path"
)
def test_generate_conf(
    mock_op_path,
    mock_template,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    content = "content"
    exp_fname = "inputs.conf"
    file_path = "output_path/inputs.conf"
    mock_op_path.return_value = file_path
    template_render = MagicMock()
    template_render.render.return_value = content

    inputs_conf = InputsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    inputs_conf.writer = MagicMock()
    inputs_conf._template = template_render
    file_paths = inputs_conf.generate_conf()

    # Ensure the appropriate methods were called and the file was generated
    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1
    inputs_conf.writer.assert_called_once_with(
        file_name=exp_fname,
        file_path=file_path,
        content=content,
    )
    assert file_paths == {exp_fname: file_path}


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.InputsConf.set_template_and_render"
)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.InputsConf.get_file_output_path"
)
def test_generate_conf_spec(
    mock_op_path,
    mock_template,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    content = "content"
    exp_fname = "inputs.conf.spec"
    file_path = "output_path/inputs.conf.spec"
    mock_op_path.return_value = file_path
    mock_template_render = MagicMock()
    mock_template_render.render.return_value = content

    inputs_conf = InputsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    inputs_conf.writer = MagicMock()
    inputs_conf._template = mock_template_render

    file_paths = inputs_conf.generate_conf_spec()

    # Ensure the appropriate methods were called and the file was generated
    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1
    inputs_conf.writer.assert_called_once_with(
        file_name=exp_fname,
        file_path=file_path,
        content=content,
    )
    assert file_paths == {exp_fname: file_path}


def test_inputs_conf_content(global_config_all_json, input_dir, output_dir, ta_name):
    inputs_conf = InputsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=UCC_DIR,
        addon_name=ta_name,
    )
    generated_files = inputs_conf.generate_conf()
    assert generated_files is not None
    assert generated_files.keys() == {"inputs.conf"}
    assert (
        Path(generated_files["inputs.conf"]).read_text()
        == dedent(
            """
            [example_input_one]
            python.version = python3
            input_one_radio = yes
            index = default
            order_by = LastModifiedDate
            use_existing_checkpoint = yes
            limit = 1000

            [example_input_two]
            python.version = python3
            disabled = true
            index = default
            input_two_checkbox_bool = true
            input_two_radio = yes
            use_existing_checkpoint = yes
            """
        ).lstrip()
    )


def test_inputs_disable_two_inputs(tmp_path, input_dir, output_dir, ta_name):
    config_content = json.loads(
        Path(get_testdata_file_path("valid_config.json")).read_text()
    )
    services = config_content["pages"]["inputs"]["services"]
    assert len(services) == 2
    services[0]["disableNewInput"] = True
    services[1]["disableNewInput"] = True
    config = tmp_path / "valid_config_disable.json"
    config.write_text(json.dumps(config_content))

    inputs_conf = InputsConf(
        GlobalConfig.from_file(str(config)),
        input_dir,
        output_dir,
        ucc_dir=UCC_DIR,
        addon_name=ta_name,
    )
    generated_files = inputs_conf.generate_conf()
    assert generated_files is not None
    assert generated_files.keys() == {"inputs.conf"}
    assert (
        Path(generated_files["inputs.conf"]).read_text()
        == dedent(
            """
            [example_input_one]
            python.version = python3
            disabled = true
            input_one_radio = yes
            index = default
            order_by = LastModifiedDate
            use_existing_checkpoint = yes
            limit = 1000

            [example_input_two]
            python.version = python3
            disabled = true
            index = default
            input_two_checkbox_bool = true
            input_two_radio = yes
            use_existing_checkpoint = yes
            """
        ).lstrip()
    )

    specs = inputs_conf.generate_conf_spec()
    assert specs is not None
    assert specs.keys() == {"inputs.conf.spec"}
    assert Path(specs["inputs.conf.spec"]).read_text() == "\n".join(
        [
            "[example_input_one://<name>]",
            "account = ",
            "example_help_link = ",
            "index = (Default: default)",
            "input_one_checkbox = This is an example checkbox for the input one entity",
            "input_one_radio = This is an example radio button for the input one entity (Default: yes)",
            "interval = Time interval of the data input, in seconds.",
            "limit = The maximum number of results returned by the query. (Default: 1000)",
            "multipleSelectTest = ",
            "object = The name of the object to query for.",
            "object_fields = Object fields from which to collect data. Delimit multiple fields using a comma.",
            "order_by = The datetime field by which to query results in ascending order for indexing. (Default: "
            "LastModifiedDate)",
            "singleSelectTest = ",
            "start_date = The datetime after which to query and index records, in this "
            'format: "YYYY-MM-DDThh:mm:ss.000z". Defaults to 90 days earlier from now.',
            "use_existing_checkpoint = Data input already exists. Select `No` if you want to reset the data "
            "collection. (Default: yes)",
            "",
            "[example_input_two://<name>]",
            "account = ",
            "api1 = ",
            "api2 = ",
            "api3 = ",
            "example_help_link = ",
            "index = (Default: default)",
            "input_two_checkbox = This is an example checkbox for the input two entity",
            "input_two_checkbox_bool = This is an example checkbox for the input two entity with bool default "
            "(Default: true)",
            "input_two_multiple_select = This is an example multipleSelect for input two entity",
            "input_two_radio = This is an example radio button for the input two entity (Default: yes)",
            "interval = Time interval of the data input, in seconds .",
            'start_date = The date and time, in "YYYY-MM-DDThh:mm:ss.000z" format, after which to query and '
            "index records.  The default is 90 days before today.",
            "use_existing_checkpoint = Data input already exists. Select `No` if you want to reset the data "
            "collection. (Default: yes)\n",
        ]
    )


def test_inputs_conf_content_input_with_conf(input_dir, output_dir, ta_name, tmp_path):
    config_content = json.loads(
        Path(get_testdata_file_path("valid_config.json")).read_text()
    )
    config_content["pages"]["inputs"]["services"] = [
        {
            "name": "example_input_three",
            "conf": "some_conf",
            "entity": [
                {
                    "type": "text",
                    "label": "Name",
                    "field": "name",
                    "required": True,
                },
                {
                    "type": "text",
                    "label": "Required field",
                    "field": "required_field",
                    "required": True,
                },
                {
                    "type": "text",
                    "label": "Optional field",
                    "field": "optional_field",
                    "required": False,
                },
                {
                    "type": "text",
                    "label": "Field with description",
                    "field": "field_desc",
                    "required": False,
                    "help": "Some description",
                },
            ],
            "title": "Example Input Three",
            "disableNewInput": True,
        }
    ]
    config = tmp_path / "valid_config_input_with_conf.json"
    config.write_text(json.dumps(config_content))

    inputs_conf = InputsConf(
        GlobalConfig.from_file(str(config)),
        input_dir,
        output_dir,
        ucc_dir=UCC_DIR,
        addon_name=ta_name,
    )

    conf = inputs_conf.generate_conf()
    assert conf is not None
    assert Path(conf["inputs.conf"]).read_text() == (
        "[example_input_three]\npython.version = python3\n"
    )

    specs = inputs_conf.generate_conf_spec()
    assert specs is not None
    assert specs.keys() == {"some_conf.conf.spec"}
    assert Path(specs["some_conf.conf.spec"]).read_text() == "\n".join(
        [
            "[<name>]",
            "required_field = ",
            "optional_field = ",
            "field_desc = Some description\n",
        ]
    )
