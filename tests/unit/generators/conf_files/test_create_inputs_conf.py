import json
import os
from pathlib import Path
from textwrap import dedent
from typing import Dict, List
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

    assert inputs_conf.input_names == []


def test_set_attributes_with_conf_key(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    """Test when a service has a 'conf' key."""
    inputs_conf = InputsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    inputs_conf._global_config = MagicMock()
    inputs_conf._global_config.inputs = [{"name": "service1", "conf": "some_conf"}]

    inputs_conf._set_attributes()

    expected_output = [{"service1": ["placeholder = placeholder"]}]
    assert inputs_conf.input_names == expected_output
    assert inputs_conf.conf_file == "inputs.conf"
    assert inputs_conf.conf_spec_file == "inputs.conf.spec"


def test_set_attributes_without_conf_key_and_name_field(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    """Test when a service does not have 'conf' key and 'entity' contains 'name' field."""
    inputs_conf = InputsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    inputs_conf._global_config = MagicMock()
    inputs_conf._global_config.inputs = [
        {"name": "service1", "entity": [{"field": "name"}], "disableNewInput": True}
    ]

    inputs_conf._set_attributes()

    expected_output: List[Dict[str, List[str]]] = [{"service1": []}]
    assert inputs_conf.input_names == expected_output
    assert inputs_conf.disable is True
    assert inputs_conf.service_name == "service1"


def test_set_attributes_without_conf_key_and_other_fields(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    """Test when a service does not have 'conf' key and 'entity' contains fields other than 'name'."""
    inputs_conf = InputsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    inputs_conf._global_config = MagicMock()
    inputs_conf._global_config.inputs = [
        {
            "name": "service1",
            "entity": [
                {
                    "field": "other_field",
                    "help": "help text",
                    "defaultValue": "default_val",
                }
            ],
        }
    ]

    inputs_conf._set_attributes()

    expected_output = [{"service1": ["other_field = help text  Default: default_val"]}]
    assert inputs_conf.input_names == expected_output
    assert inputs_conf.default_value_info == {
        "service1": {"other_field": "default_val"}
    }


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
    "splunk_add_on_ucc_framework.generators.conf_files.InputsConf._set_attributes",
    return_value=MagicMock(),
)
def test_generate_conf_spec_no_input_names(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    inputs_conf = InputsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    inputs_conf.input_names = []
    result = inputs_conf.generate_conf()
    assert result is None


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


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.InputsConf._set_attributes",
    return_value=MagicMock(),
)
def test_generate_conf_no_input_names(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    inputs_conf = InputsConf(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    inputs_conf.input_names = []
    result = inputs_conf.generate_conf_spec()
    assert result is None


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
            input_two_radio = yes
            use_existing_checkpoint = yes
            """
        ).lstrip()
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
                    "validators": [
                        {
                            "type": "regex",
                            "pattern": "^[a-zA-Z]\\w*$",
                        },
                    ],
                    "field": "name",
                    "required": True,
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
    generated_files = inputs_conf.generate_conf()
    assert generated_files is not None
    assert generated_files.keys() == {"inputs.conf"}
    assert (
        Path(generated_files["inputs.conf"]).read_text()
        == dedent(
            """
            [example_input_three]
            python.version = python3
            disabled = true
            """
        ).lstrip()
    )
