from unittest import mock
import tests.unit.helpers as helpers
import json
import pytest

from splunk_add_on_ucc_framework.commands import init


@pytest.mark.parametrize(
    "addon_name,expected",
    [
        ("test-addon", True),
        ("demo_addon", True),
        ("foo/bar/baz", False),
        ("Test.", False),
        ("12Test", False),
        ("test-addon-123", True),
        ("test.tar", False),
        ("test.tgz", False),
        ("test.tar.gz", False),
        ("test.spl", False),
        ("CON", False),
        ("PRN", False),
        ("AUX", False),
        ("NUL", False),
        ("COM1", False),
        ("COM2", False),
        ("COM3", False),
        ("COM4", False),
        ("COM5", False),
        ("COM6", False),
        ("COM7", False),
        ("COM8", False),
        ("COM9", False),
        ("LPT1", False),
        ("LPT2", False),
        ("LPT3", False),
        ("LPT4", False),
        ("LPT5", False),
        ("LPT6", False),
        ("LPT7", False),
        ("LPT8", False),
        ("LPT9", False),
        ("test@add-on", False),
        ("test.add-on_123_", True),
    ],
)
def test__is_valid_addon_name(addon_name, expected):
    assert init._is_valid_addon_name(addon_name) is expected


@pytest.mark.parametrize(
    "rest_root,expected",
    [
        ("test-addon", True),
        ("demo_addon", True),
        ("test@addon", False),
        ("Test!_addon", False),
        ("test-addon_123", True),
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
                "need_proxy": True,
            },
            (
                "addon_name",
                "Addon For Demo",
                "input_name",
                "0.0.1",
                "addon_name",
                False,
                True,
                None,
                None,
            ),
        ),
        (
            {
                "addon_name": "addon_name",
                "addon_rest_root": "addon_name",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
                "overwrite": True,
            },
            (
                "addon_name",
                "Addon For Demo",
                "input_name",
                "0.0.1",
                "addon_name",
                True,
                False,
                None,
                None,
            ),
        ),
        (
            {
                "addon_name": "addon_name",
                "addon_rest_root": "addon_rest_root",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
                "add_license": "Apache License 2.0",
            },
            (
                "addon_name",
                "Addon For Demo",
                "input_name",
                "0.0.1",
                "addon_rest_root",
                False,
                False,
                "Apache License 2.0",
                None,
            ),
        ),
        (
            {
                "addon_name": "addon_name",
                "addon_rest_root": "addon_rest_root",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
                "overwrite": True,
                "add_license": "Apache License 2.0",
                "include_author": "test_author",
            },
            (
                "addon_name",
                "Addon For Demo",
                "input_name",
                "0.0.1",
                "addon_rest_root",
                True,
                False,
                "Apache License 2.0",
                "test_author",
            ),
        ),
        (
            {
                "addon_name": "addon_name",
                "addon_rest_root": "addon_rest_root",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
                "overwrite": True,
                "add_license": "Apache License 2.0",
                "include_author": "   test author   ",
            },
            (
                "addon_name",
                "Addon For Demo",
                "input_name",
                "0.0.1",
                "addon_rest_root",
                True,
                False,
                "Apache License 2.0",
                "test author",
            ),
        ),
        (
            {
                "addon_name": "addon_name",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
                "overwrite": True,
                "need_proxy": True,
            },
            (
                "addon_name",
                "Addon For Demo",
                "input_name",
                "0.0.1",
                "addon_name",
                True,
                True,
                None,
                None,
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
                "addon_name": "addon-name()",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
            }
        ),
        (
            {
                "addon_name": "addon_name",
                "addon_rest_root": "addon!name",
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
                "addon_input_name": "x" * 51,
                "addon_version": "0.0.1",
            }
        ),
        (
            {
                "addon_name": "addon_name",
                "addon_rest_root": "addon_rest_root",
                "addon_display_name": "Addon For Demo",
                "addon_input_name": "input_name",
                "addon_version": "0.0.1",
                "include_author": "",
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


@mock.patch("splunk_add_on_ucc_framework.commands.init._generate_addon")
def test_init_when_empty_string_passed_for_author(mock_generate_addon, caplog):
    mock_generate_addon.side_effect = SystemExit

    with pytest.raises(SystemExit):
        init.init(
            "test_addon",
            "Addon For Demo Already Exists",
            "input_name",
            "0.0.1",
            include_author="",
        )
        expected_error_message = (
            "The author name cannot be left empty, please provide some input. "
        )
        assert expected_error_message in caplog.text


def test_valid_regex():
    file_path = f"{helpers.get_path_to_source_dir()}/schema/schema.json"
    with open(file_path) as file:
        content = file.read()
        schema_json_content = json.loads(content)
    restRoot_regex = schema_json_content["definitions"]["Meta"]["properties"][
        "restRoot"
    ]["pattern"]
    name_regex = schema_json_content["definitions"]["Meta"]["properties"]["name"][
        "pattern"
    ]
    assert init.ADDON_REST_ROOT_RE_STR == restRoot_regex
    assert init.ADDON_NAME_RE_STR == name_regex
