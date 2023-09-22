from unittest import mock

import pytest

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


@mock.patch("splunk_add_on_ucc_framework.commands.init._generate_addon")
@pytest.mark.parametrize(
    "init_kwargs,expected_args_to_generate_addon",
    [
        (
            {
                "addon_name": "addon_name",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
            },
            (
                "addon_name",
                "Addon For Demo",
                "input_name",
                "0.0.1",
                "addon_name",
                False,
            ),
        ),
        (
            {
                "addon_name": "addon_name",
                "addon_rest_root": "addon_name",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
            },
            (
                "addon_name",
                "Addon For Demo",
                "input_name",
                "0.0.1",
                "addon_name",
                False,
            ),
        ),
        (
            {
                "addon_name": "addon_name",
                "addon_rest_root": "addon_rest_root",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
            },
            (
                "addon_name",
                "Addon For Demo",
                "input_name",
                "0.0.1",
                "addon_rest_root",
                False,
            ),
        ),
    ],
)
def test_init(mock_generate_addon, init_kwargs, expected_args_to_generate_addon):
    init.init(**init_kwargs)

    mock_generate_addon.assert_called_once_with(*expected_args_to_generate_addon)


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


@mock.patch("splunk_add_on_ucc_framework.commands.init._generate_addon")
def test_init_when_folder_already_exists(mock_generate_addon, caplog):
    mock_generate_addon.side_effect = SystemExit

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
