from unittest import mock

import cookiecutter
import pytest

from splunk_add_on_ucc_framework.commands import init


@mock.patch("cookiecutter.main.cookiecutter")
def test_init(mock_cookiecutter_main_cookiecutter):
    init.init(
        "addon_name",
        "Addon For Demo",
        "input_name",
        "0.0.1",
    )

    mock_cookiecutter_main_cookiecutter.assert_called_once()


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
