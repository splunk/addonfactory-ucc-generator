import os
from unittest.mock import MagicMock, patch
import pytest
import platform

from splunk_add_on_ucc_framework.commands.build import (
    _add_modular_input,
    _get_build_output_path,
    _get_python_version_from_executable,
    _get_and_check_global_config_path,
    generate,
)
from splunk_add_on_ucc_framework.exceptions import (
    CouldNotIdentifyPythonVersionException,
)

from splunk_add_on_ucc_framework import __version__

CURRENT_PATH = os.getcwd()


@pytest.mark.parametrize(
    "output_directory,expected_output_directory",
    [
        (None, os.path.join(CURRENT_PATH, "output")),
        ("output", os.path.join(CURRENT_PATH, "output")),
        ("output/foo", os.path.join(CURRENT_PATH, "output", "foo")),
        ("/tmp/foo", "/tmp/foo"),
    ],
)
def test_get_build_output_path(output_directory, expected_output_directory):
    assert expected_output_directory == _get_build_output_path(output_directory)


@patch("splunk_add_on_ucc_framework.commands.build.subprocess.run")
def test_get_python_version_from_executable(mock_run):
    target_python_version = "Python 3.8.17"

    mock_stdout = MagicMock()
    mock_stdout.configure_mock(**{"stdout.decode.return_value": target_python_version})

    mock_run.return_value = mock_stdout

    python_version = _get_python_version_from_executable("python3")

    assert python_version == target_python_version


def test_get_and_check_global_config_path():
    source = os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "testdata", "package"
    )
    assert _get_and_check_global_config_path(source, "") == ""
    assert _get_and_check_global_config_path(source, "invalid_ext.txt") == ""

    expected_return = os.path.join(
        os.path.dirname(os.path.realpath(__file__)),
        os.pardir,
        "testdata",
        "valid_config.json",
    )
    assert _get_and_check_global_config_path(source, expected_return) is expected_return

    expected_return = os.path.join(
        os.path.dirname(os.path.realpath(__file__)),
        os.pardir,
        "testdata",
        "valid_config.yaml",
    )
    assert _get_and_check_global_config_path(source, expected_return) is expected_return

    base = os.path.join(
        os.path.dirname(os.path.realpath(__file__)),
        os.pardir,
        os.pardir,
        "testdata",
        "test_addons",
        "package_global_config_everything",
    )
    source = os.path.join(base, "package")
    expected_return = os.path.join(base, "globalConfig.json")
    assert _get_and_check_global_config_path(source, "") == os.path.abspath(
        expected_return
    )


def test_get_python_version_from_executable_nonexisting_command():
    target_python_version = (
        "acommandthatdoesnotexistda39a3ee5e6b4b0d3255bfef95601890afd80709"
    )

    with pytest.raises(CouldNotIdentifyPythonVersionException):
        _get_python_version_from_executable(target_python_version)


@pytest.mark.parametrize(
    "helpers",
    [
        "example_helper",
        "example_helper_no_stream_events",
        "example_helper_not_callable",
    ],
)
@patch("splunk_add_on_ucc_framework.global_config.GlobalConfig")
def test_add_modular_input(GlobalConfig, helpers, tmp_path):
    ta_name = "test_ta"
    (tmp_path / ta_name / "bin").mkdir(parents=True)
    (tmp_path / ta_name / "default").mkdir(parents=True)

    helpers_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "testdata/",
    )

    gc = GlobalConfig.from_file("", False)
    gc.inputs = [
        {
            "name": "example_input_three",
            "restHandlerName": "splunk_ta_uccexample_rh_three_custom",
            "inputHelperModule": helpers,
            "entity": [
                {
                    "type": "text",
                    "label": "Name",
                    "validators": [
                        {
                            "type": "regex",
                            "errorMsg": "...",
                            "pattern": "^[a-zA-Z]\\w*$",
                        },
                        {
                            "type": "string",
                            "errorMsg": "Length of input name should be between 1 and 100",
                            "minLength": 1,
                            "maxLength": 100,
                        },
                    ],
                    "field": "name",
                    "help": "A unique name for the data input.",
                    "required": True,
                },
                {
                    "type": "text",
                    "label": "Interval",
                    "validators": [
                        {
                            "type": "regex",
                            "errorMsg": "Interval must be an integer.",
                            "pattern": "^\\-[1-9]\\d*$|^\\d*$",
                        }
                    ],
                    "field": "interval",
                    "help": "Time interval of the data input, in seconds.",
                    "required": True,
                },
            ],
            "title": "Example Input Three",
        }
    ]
    if helpers == "example_helper_no_stream_events":
        with pytest.raises(SystemExit):
            _add_modular_input(ta_name, gc, str(tmp_path), helpers_path)

    if helpers == "example_helper_not_callable":
        with pytest.raises(SystemExit):
            _add_modular_input(ta_name, gc, str(tmp_path), helpers_path)

    if helpers == "example_helper":
        _add_modular_input(ta_name, gc, str(tmp_path), helpers_path)

        input_path = tmp_path / ta_name / "bin" / "example_input_three.py"
        helper_path = tmp_path / ta_name / "bin" / "example_helper.py"
        assert input_path.is_file()
        assert helper_path.is_file()


@patch("splunk_add_on_ucc_framework.global_config.GlobalConfig")
@patch("splunk_add_on_ucc_framework.commands.build.get_app_manifest")
@patch("splunk_add_on_ucc_framework.commands.build._get_and_check_global_config_path")
@patch("os.path.exists")
@patch(
    "splunk_add_on_ucc_framework.commands.build.global_config_update.handle_global_config_update"
)
@patch(
    "splunk_add_on_ucc_framework.commands.build.global_config_validator.GlobalConfigValidator.validate"
)
def test_ta_name_mismatch(
    mock_GlobalConfigValidator,
    mock_global_config_update,
    mock_os_path,
    mock_get_and_check_global_config_path,
    mock_get_app_manifest,
    mock_global_config,
    caplog,
):
    mock_os_path.return_value = True

    mock_app_manifest = MagicMock()
    mock_app_manifest.get_addon_name.return_value = "ta_name_1"
    mock_get_app_manifest.return_value = mock_app_manifest

    mock_global_config_instance = MagicMock()
    mock_global_config_instance.product = "ta_name_2"
    mock_get_and_check_global_config_path.return_value = "mock_gc_path"
    mock_global_config.return_value = mock_global_config_instance

    mock_global_config_update.return_value = None
    mock_GlobalConfigValidator.return_value = True

    with pytest.raises(SystemExit):
        generate(
            source="source/path",
            addon_version="1.0.0",
            python_binary_name="python3",
            verbose_file_summary_report=False,
            pip_version="latest",
            pip_legacy_resolver=False,
            ui_source_map=False,
        )


@patch("splunk_add_on_ucc_framework.commands.build._get_build_output_path")
def test_uncaught_exception(mock_get_build_output_path, caplog):
    mock_get_build_output_path.side_effect = ValueError("Some exc msg")

    expected_msg_1 = "Uncaught exception occurred. Exception details:"
    expected_msg_2 = (
        "You can report this issue using: https://github.com/splunk/"
        "addonfactory-ucc-generator/issues/new?template=bug_report.yml&title=%5BBUG%5D%20Some%20"
        "exc%20msg&description="
    )
    expected_params = f"&ucc_version={__version__}&system_info={platform.system()}"

    generate(
        source="source/path",
        addon_version="1.0.0",
        python_binary_name="python3",
        verbose_file_summary_report=False,
        pip_version="latest",
        pip_legacy_resolver=False,
        ui_source_map=False,
    )

    whitespaces = [el for el in caplog.messages[-1].split("https")[1] if el.isspace()]

    assert len(whitespaces) == 0
    assert expected_msg_1 in caplog.text and expected_msg_2 in caplog.text
    assert expected_params in caplog.text


def test_source_directory_not_found(caplog):
    expected_msg = "Source directory: 'some/unexisting/path' does not exist. Please verify that given source exists."

    with pytest.raises(SystemExit):
        generate(
            source="some/unexisting/path",
            addon_version="1.0.0",
            python_binary_name="python3",
            verbose_file_summary_report=False,
            pip_version="latest",
            pip_legacy_resolver=False,
            ui_source_map=False,
        )

    assert expected_msg == caplog.messages[-1]
