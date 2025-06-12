from splunk_add_on_ucc_framework.generators import FileGenerator
from splunk_add_on_ucc_framework.generators.file_generator import begin
from unittest.mock import patch, MagicMock
from pytest import raises, fixture
from jinja2 import Template
from splunk_add_on_ucc_framework import __file__ as ucc_framework_file
import os.path
import shutil

UCC_DIR = os.path.dirname(ucc_framework_file)


@fixture
def addon_version():
    return "1.0.0"


@fixture
def has_ui():
    return True


@fixture
def app_manifest():
    mock_manifest = MagicMock()
    mock_manifest.get_description.return_value = "Test Description"
    mock_manifest.get_authors.return_value = [{"name": "Test Author"}]
    mock_manifest.get_title.return_value = "Test Addon"
    return mock_manifest


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
@patch(
    "splunk_add_on_ucc_framework.generators.FileGenerator._get_output_dir",
    return_value="tmp/path",
)
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
    assert result == "tmp/path/output_file"

    # Test with list
    result = file_gen.get_file_output_path(["dir1", "dir2", "output_file"])
    assert result == "tmp/path/dir1/dir2/output_file"

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


@patch.object(shutil, "copy")
def test_begin(
    mock_copy,
    global_config_all_json,
    input_dir,
    output_dir,
    ta_name,
    addon_version,
    has_ui,
    app_manifest,
):
    result = begin(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=UCC_DIR,
        addon_name=ta_name,
        addon_version=addon_version,
        has_ui=has_ui,
        app_manifest=app_manifest,
    )
    assert result == [
        {"app.conf": f"{output_dir}/{ta_name}/default/app.conf"},
        {"inputs.conf": f"{output_dir}/{ta_name}/default/inputs.conf"},
        {"inputs.conf.spec": f"{output_dir}/{ta_name}/README/inputs.conf.spec"},
        {"server.conf": f"{output_dir}/{ta_name}/default/server.conf"},
        {"restmap.conf": f"{output_dir}/{ta_name}/default/restmap.conf"},
        {"web.conf": f"{output_dir}/{ta_name}/default/web.conf"},
        {"alert_actions.conf": f"{output_dir}/{ta_name}/default/alert_actions.conf"},
        {
            "alert_actions.conf.spec": f"{output_dir}/{ta_name}/README/alert_actions.conf.spec"
        },
        {"eventtypes.conf": f"{output_dir}/{ta_name}/default/eventtypes.conf"},
        {"tags.conf": f"{output_dir}/{ta_name}/default/tags.conf"},
        {"commands.conf": f"{output_dir}/{ta_name}/default/commands.conf"},
        {"searchbnf.conf": f"{output_dir}/{ta_name}/default/searchbnf.conf"},
        {
            "splunk_ta_uccexample_account.conf.spec": f"{output_dir}/{ta_name}/"
            "README/splunk_ta_uccexample_account.conf.spec"
        },
        {
            "splunk_ta_uccexample_settings.conf": f"{output_dir}/{ta_name}/default/splunk_ta_uccexample_settings.conf"
        },
        {
            "splunk_ta_uccexample_settings.conf.spec": f"{output_dir}/{ta_name}/"
            "README/splunk_ta_uccexample_settings.conf.spec"
        },
        {
            "configuration.xml": f"{output_dir}/{ta_name}/default/data/ui/views/configuration.xml"
        },
        {
            "dashboard.xml": f"{output_dir}/{ta_name}/default/data/ui/views/dashboard.xml"
        },
        {"default.xml": f"{output_dir}/{ta_name}/default/data/ui/nav/default.xml"},
        {"inputs.xml": f"{output_dir}/{ta_name}/default/data/ui/views/inputs.xml"},
        {
            "test_addon_redirect.xml": f"{output_dir}/{ta_name}/default/data/ui/views/test_addon_redirect.xml"
        },
        {
            "test_alert.html": f"{output_dir}/{ta_name}/default/data/ui/alerts/test_alert.html"
        },
        {
            "generatetextcommand.py": f"{output_dir}/{ta_name}/bin/generatetextcommand.py"
        },
    ]


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
