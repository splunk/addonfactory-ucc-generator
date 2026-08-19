from unittest import mock

import pytest

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


def test_validate_invokes_binary_with_forwarded_arguments():
    with mock.patch.object(
        validate.shutil, "which", return_value="/usr/local/bin/splunk-appinspect"
    ), mock.patch.object(validate.subprocess, "run") as mock_run:
        mock_run.return_value = mock.Mock(returncode=0)

        validate.validate(
            file_path="output/foo",
            output_file="/tmp/report.txt",
            log_level="WARNING",
            log_file="/tmp/validation.log",
            max_messages="all",
        )

    mock_run.assert_called_once_with(
        [
            "/usr/local/bin/splunk-appinspect",
            "inspect",
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


def test_validate_exits_when_binary_not_found():
    with mock.patch.object(validate.shutil, "which", return_value=None):
        with pytest.raises(SystemExit) as exc_info:
            validate.validate(file_path="output/foo")

    assert exc_info.value.code == 1


def test_validate_exits_when_binary_resolved_from_cwd(tmp_path):
    fake_binary = tmp_path / "splunk-appinspect"
    fake_binary.touch()

    with mock.patch.object(
        validate.shutil, "which", return_value=str(fake_binary)
    ), mock.patch.object(validate.pathlib.Path, "cwd", return_value=tmp_path):
        with pytest.raises(SystemExit) as exc_info:
            validate.validate(file_path="output/foo")

    assert exc_info.value.code == 1


def test_validate_propagates_nonzero_exit_code():
    with mock.patch.object(
        validate.shutil, "which", return_value="/usr/local/bin/splunk-appinspect"
    ), mock.patch.object(validate.subprocess, "run") as mock_run:
        mock_run.return_value = mock.Mock(returncode=3)

        with pytest.raises(SystemExit) as exc_info:
            validate.validate(file_path="output/foo")

    assert exc_info.value.code == 3
