from splunk_add_on_ucc_framework.generators import FileGenerator
from splunk_add_on_ucc_framework.generators.file_generator import begin
from unittest.mock import patch, MagicMock
from pytest import raises, fixture
from jinja2 import Template


@fixture
def set_attr():
    return {"file_name": "file_path"}


def mocked__set_attribute(this, **kwargs):
    this.attrib_1 = "value_1"
    this.attrib_2 = "value_2"


@patch("splunk_add_on_ucc_framework.generators.FileGenerator._set_attributes")
def test_get_output_dir(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    file_gen = FileGenerator(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    expected_output_dir = f"{output_dir}/test_addon"
    assert file_gen._get_output_dir() == expected_output_dir


@patch("splunk_add_on_ucc_framework.generators.FileGenerator._set_attributes")
def test_get_file_output_path(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    file_gen = FileGenerator(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    # Test with string
    result = file_gen.get_file_output_path("output_file")
    assert result == f"{output_dir}/{ta_name}/output_file"

    # Test with list
    result = file_gen.get_file_output_path(["dir1", "dir2", "output_file"])
    assert result == f"{output_dir}/{ta_name}/dir1/dir2/output_file"

    # Test with invalid type
    with raises(TypeError):
        file_gen.get_file_output_path({"path": "/dummy/path"})  # type: ignore[arg-type]


@patch("splunk_add_on_ucc_framework.generators.FileGenerator._set_attributes")
@patch("jinja2.Environment.get_template")
def test_set_template_and_render(
    mock_get_template,
    mock_set_attribute,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    file_gen = FileGenerator(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    mock_get_template.return_value = Template("mock template")

    file_gen.set_template_and_render(["dir1"], "test.template")
    mock_get_template.assert_called_once_with("test.template")


@patch("splunk_add_on_ucc_framework.generators.FileGenerator._set_attributes")
@patch("jinja2.Environment.get_template")
def test_set_template_and_render_invalid_file_name(
    mock_get_template,
    mock_set_attribute,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    file_gen = FileGenerator(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    mock_get_template.return_value = Template("mock template")
    # Test with invalid file name
    with raises(AssertionError):
        file_gen.set_template_and_render(["dir1"], "test.invalid")


@patch(
    "splunk_add_on_ucc_framework.generators.file_generator.fc.GEN_FILE_LIST",
    new_callable=list,
)
def test_begin(
    mock_gen_file_list,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    caplog,
):
    mock_item = MagicMock()
    mock_item.file_class.return_value.generate.return_value = {
        "file1": "/path/to/file1"
    }

    mock_gen_file_list.extend([mock_item])

    result = begin(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert result == [{"file1": "/path/to/file1"}]
    expected_msg = "Successfully generated 'file1' at '/path/to/file1'."
    assert expected_msg in caplog.text


@patch(
    "splunk_add_on_ucc_framework.generators.file_generator.fc.GEN_FILE_LIST",
    new_callable=list,
)
@patch("splunk_add_on_ucc_framework.generators.file_generator.logger")
def test_begin_if_empty_dict(
    mock_logger,
    mock_gen_file_list,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    mock_item = MagicMock()
    mock_item.file_class.return_value.generate.return_value = {"": "/path/to/file1"}

    mock_gen_file_list.extend([mock_item])

    result = begin(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert result == [{"": "/path/to/file1"}]
    mock_logger.info.assert_not_called()


def test__set_attributes_error(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    """
    This tests that the exception provided in side_effect is raised too
    """
    with raises(NotImplementedError):
        FileGenerator(
            global_config_all_json,
            input_dir,
            output_dir,
            ucc_dir=ucc_dir,
            addon_name=ta_name,
        )


@patch("splunk_add_on_ucc_framework.generators.FileGenerator._set_attributes")
def test_generate(
    mock_set_attribute, global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    """
    This tests that the exception provided in side_effect is raised too
    """
    file_gen = FileGenerator(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    with raises(NotImplementedError):
        file_gen.generate()
