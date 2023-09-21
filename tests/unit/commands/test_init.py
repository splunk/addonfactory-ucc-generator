import os
from unittest import mock

import cookiecutter
import pytest

import tests.unit.helpers as helpers

from splunk_add_on_ucc_framework.commands import init


@pytest.mark.parametrize(
    "addon_name,expected",
    [
        ("test-addon", True),
        ("demo_addon", True),
        ("foo/bar/baz", False),
    ],
)
def test__is_valid_addon_name(addon_name, expected):
    assert init._is_valid_addon_name(addon_name) is expected


@pytest.mark.parametrize(
    "rest_root,expected",
    [
        ("test-addon", False),
        ("demo_addon", True),
    ],
)
def test__is_valid_rest_root(rest_root, expected):
    assert init._is_valid_rest_root_name(rest_root) is expected


@pytest.mark.parametrize(
    "input_name,expected",
    [
        ("test-addon", True),
        ("demo_addon", True),
        ("foo" * 51, False),
    ],
)
def test__is_valid_input_name(input_name, expected):
    assert init._is_valid_input_name(input_name) is expected


@mock.patch("cookiecutter.main.cookiecutter")
@pytest.mark.parametrize(
    "init_kwargs,expected_extra_content",
    [
        (
            {
                "addon_name": "addon_name",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
            },
            {
                "addon_name": "addon_name",
                "addon_rest_root": "addon_name",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
            },
        ),
        (
            {
                "addon_name": "addon_name",
                "addon_rest_root": "addon_name",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
            },
            {
                "addon_name": "addon_name",
                "addon_rest_root": "addon_name",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
            },
        ),
        (
            {
                "addon_name": "addon_name",
                "addon_rest_root": "addon_rest_root",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
            },
            {
                "addon_name": "addon_name",
                "addon_rest_root": "addon_rest_root",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
            },
        ),
    ],
)
def test_init(mock_cookiecutter_main_cookiecutter, init_kwargs, expected_extra_content):
    init.init(**init_kwargs)

    expected_path_to_template = os.path.join(
        helpers.get_path_to_source_dir(), "commands", "init_template"
    )
    mock_cookiecutter_main_cookiecutter.assert_called_once_with(
        template=expected_path_to_template,
        overwrite_if_exists=False,
        no_input=True,
        extra_context=expected_extra_content,
    )


@pytest.mark.parametrize(
    "init_kwargs",
    [
        (
            {
                "addon_name": "foo/bar",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
            }
        ),
        (
            {
                "addon_name": "addon-name",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
            }
        ),
        (
            {
                "addon_name": "addon_name",
                "addon_rest_root": "addon-name",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
            }
        ),
        (
            {
                "addon_name": "addon_name",
                "addon_rest_root": "addon_rest_root",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "foo" * 51,
                "addon_version": "0.0.1",
            }
        ),
    ],
)
def test_init_when_incorrect_parameters_then_sys_exit(init_kwargs):
    with pytest.raises(SystemExit):
        init.init(**init_kwargs)


@mock.patch("cookiecutter.main.cookiecutter")
def test_init_when_folder_already_exists(mock_cookiecutter_main_cookiecutter, caplog):
    mock_cookiecutter_main_cookiecutter.side_effect = (
        cookiecutter.exceptions.OutputDirExistsException
    )

    with pytest.raises(SystemExit):
        init.init(
            "addon_name_already_exists",
            "Addon For Demo Already Exists",
            "input_name",
            "0.0.1",
        )
        expected_error_message = (
            "The location is already taken, use `--overwrite` "
            "option to overwrite the content of existing folder."
        )
        assert expected_error_message in caplog.text
