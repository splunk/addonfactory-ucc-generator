import os
from unittest.mock import MagicMock, patch

import pytest

from splunk_add_on_ucc_framework.commands.build import (
    _add_modular_input,
    _get_build_output_path,
    _get_python_version_from_executable,
    _get_and_check_global_config_path,
)
from splunk_add_on_ucc_framework.exceptions import (
    CouldNotIdentifyPythonVersionException,
)

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
    assert None is _get_and_check_global_config_path(source, "")
    assert None is _get_and_check_global_config_path(source, "invalid_ext.txt")

    expected_return = os.path.join(
        os.path.dirname(os.path.realpath(__file__)),
        os.pardir,
        "testdata",
        "valid_config.json",
    )
    assert expected_return is _get_and_check_global_config_path(source, expected_return)

    expected_return = os.path.join(
        os.path.dirname(os.path.realpath(__file__)),
        os.pardir,
        "testdata",
        "valid_config.yaml",
    )
    assert expected_return is _get_and_check_global_config_path(source, expected_return)

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
    assert os.path.abspath(expected_return) == _get_and_check_global_config_path(
        source, ""
    )


def test_get_python_version_from_executable_nonexisting_command():
    target_python_version = (
        "acommandthatdoesnotexistda39a3ee5e6b4b0d3255bfef95601890afd80709"
    )

    with pytest.raises(CouldNotIdentifyPythonVersionException):
        _get_python_version_from_executable(target_python_version)


@patch("splunk_add_on_ucc_framework.global_config.GlobalConfig")
def test_add_modular_input(GlobalConfig, tmp_path):
    ta_name = "test_ta"
    (tmp_path / ta_name / "bin").mkdir(parents=True)
    (tmp_path / ta_name / "default").mkdir(parents=True)

    gc = GlobalConfig("", False)
    gc.inputs = [
        {
            "name": "example_input_three",
            "restHandlerName": "splunk_ta_uccexample_rh_three_custom",
            "inputHelperModule": "example_helper",
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
    _add_modular_input(ta_name, gc, str(tmp_path))

    input_path = tmp_path / ta_name / "bin" / "example_input_three.py"
    helper_path = tmp_path / ta_name / "bin" / "example_helper.py"
    assert input_path.is_file()
    assert helper_path.is_file()
