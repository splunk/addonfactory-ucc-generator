import types
from unittest import mock

from splunk_add_on_ucc_framework.commands import validate


def test_build_validate_args_defaults():
    args = validate.build_validate_args("output/foo")

    assert args == ["output/foo", "--included-tags", "cloud"]


def test_build_validate_args_with_optional_parameters():
    args = validate.build_validate_args(
        "output/foo",
        output_file="/tmp/report.txt",
        log_level="WARNING",
        log_file="/tmp/validation.log",
        max_messages="all",
    )

    assert args == [
        "output/foo",
        "--included-tags",
        "cloud",
        "--output-file",
        "/tmp/report.txt",
        "--log-level",
        "WARNING",
        "--log-file",
        "/tmp/validation.log",
        "--max-messages",
        "all",
    ]


def test_validate_forwards_optional_parameters():
    mock_appinspect_validate = mock.Mock()
    fake_main = types.SimpleNamespace(validate=mock_appinspect_validate)
    fake_module = types.SimpleNamespace(main=fake_main)

    with mock.patch.dict("sys.modules", {"splunk_appinspect": fake_module}):
        validate.validate(
            file_path="output/foo",
            output_file="/tmp/report.txt",
            log_level="WARNING",
            log_file="/tmp/validation.log",
            max_messages="all",
        )

    mock_appinspect_validate.assert_called_with(
        [
            "output/foo",
            "--included-tags",
            "cloud",
            "--output-file",
            "/tmp/report.txt",
            "--log-level",
            "WARNING",
            "--log-file",
            "/tmp/validation.log",
            "--max-messages",
            "all",
        ]
    )
