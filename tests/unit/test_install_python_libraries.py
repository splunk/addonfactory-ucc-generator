import os
import stat
from unittest import mock

import pytest

from splunk_add_on_ucc_framework.install_python_libraries import (
    CouldNotInstallRequirements,
    SplunktaucclibNotFound,
    _check_ucc_library_in_requirements_file,
    install_libraries,
    install_python_libraries,
    remove_execute_bit,
    remove_package_from_installed_path,
)


@pytest.mark.parametrize(
    "requirements_content,expected_result",
    [
        ("", False),
        ("splunk-sdk", False),
        ("splunk-sdk\n", False),
        ("splunktaucclib", True),
        ("splunktaucclib\n", True),
        ("splunktaucclib==6.0.0\n", True),
        ("solnlib\nsplunktaucclib\n", True),
        ("solnlib==5.0.0\nsplunktaucclib==6.0.0\n", True),
        (
            """splunktalib==2.2.6; python_version >= "3.7" and python_version < "4.0" \
    --hash=sha256:bba70ac7407cdedcb45437cb152ac0e43aae16b978031308e6bec548d3543119 \
    --hash=sha256:8d58d697a842319b4c675557b0cc4a9c68e8d909389a98ed240e2bb4ff358d31
splunktaucclib==5.0.7; python_version >= "3.7" and python_version < "4.0" \
    --hash=sha256:3ddc1276c41c809c16ae810cb20e9eb4abd2f94dba5ddf460cf9c49b50f659ac \
    --hash=sha256:a1e3f710fcb0b24dff8913e6e5df0d36f0693b7f3ed7c0a9a43b08372b08eb90""",
            True,
        ),
        (
            """splunktaucclib==5.0.7; python_version >= "3.7" and python_version < "4.0" \
    --hash=sha256:3ddc1276c41c809c16ae810cb20e9eb4abd2f94dba5ddf460cf9c49b50f659ac \
    --hash=sha256:a1e3f710fcb0b24dff8913e6e5df0d36f0693b7f3ed7c0a9a43b08372b08eb90""",
            True,
        ),
        (
            """sortedcontainers==2.4.0; python_version >= "3.7" and python_version < "4.0" \
    --hash=sha256:a163dcaede0f1c021485e957a39245190e74249897e2ae4b2aa38595db237ee0 \
    --hash=sha256:25caa5a06cc30b6b83d11423433f65d1f9d76c4c6a0c90e3379eaa43b9bfdb88
splunk-sdk==1.7.1 \
    --hash=sha256:4d0de12a87395f28f2a0c90b179882072a39a1f09a3ec9e79ce0de7a16220fe1""",
            False,
        ),
    ],
)
def test_check_ucc_library_in_requirements_file(
    tmp_path, requirements_content, expected_result
):
    tmp_lib_path = tmp_path / "lib"
    tmp_lib_path.mkdir()
    tmp_lib_reqs_file = tmp_lib_path / "requirements.txt"
    tmp_lib_reqs_file.write_text(requirements_content)

    assert (
        _check_ucc_library_in_requirements_file(str(tmp_lib_reqs_file))
        == expected_result
    )


@mock.patch("subprocess.call", autospec=True)
def test_install_libraries(mock_subprocess_call):
    mock_subprocess_call.return_value = 0

    install_libraries(
        "package/lib/requirements.txt",
        "/path/to/output/addon_name/lib",
        "python3",
    )

    expected_install_command = (
        'python3 -m pip install -r "package/lib/requirements.txt"'
        " --no-compile --prefer-binary --ignore-installed "
        '--use-deprecated=legacy-resolver --target "'
        '/path/to/output/addon_name/lib"'
    )
    expected_pip_update_command = "python3 -m pip install pip --upgrade"
    mock_subprocess_call.assert_has_calls(
        [
            mock.call(expected_pip_update_command, shell=True),
            mock.call(expected_install_command, shell=True),
        ]
    )


@mock.patch("subprocess.call", autospec=True)
def test_install_libraries_when_subprocess_raises_os_error(mock_subprocess_call):
    mock_subprocess_call.side_effect = OSError

    with pytest.raises(CouldNotInstallRequirements):
        install_libraries(
            "package/lib/requirements.txt", "/path/to/output/addon_name/lib", "python3"
        )


@pytest.mark.parametrize(
    "subprocess_status_codes",
    [
        (127, 0),
        (0, 127),
        (1, 0),
        (0, 1),
        (-1, 0),
        (0, -1),
    ],
)
@mock.patch("subprocess.call", autospec=True)
def test_install_libraries_when_subprocess_returns_non_zero_codes(
    mock_subprocess_call,
    subprocess_status_codes,
):
    mock_subprocess_call.side_effect = subprocess_status_codes

    with pytest.raises(CouldNotInstallRequirements):
        install_libraries(
            "package/lib/requirements.txt", "/path/to/output/addon_name/lib", "python3"
        )


@mock.patch("subprocess.call", autospec=True)
def test_install_python_libraries(mock_subprocess_call, tmp_path):
    mock_subprocess_call.return_value = 0
    tmp_ucc_lib_target = tmp_path / "ucc-lib-target"
    tmp_ucc_lib_target.mkdir()
    tmp_lib_path = tmp_path / "lib"
    tmp_lib_path.mkdir()
    tmp_lib_reqs_file = tmp_lib_path / "requirements.txt"
    tmp_lib_reqs_file.write_text("splunktaucclib\n")

    install_python_libraries(
        str(tmp_path),
        str(tmp_ucc_lib_target),
        python_binary_name="python3",
        includes_ui=True,
    )


def test_install_python_libraries_when_no_requirements_file_found(caplog, tmp_path):
    tmp_ucc_lib_target = tmp_path / "ucc-lib-target"

    install_python_libraries(
        str(tmp_path),
        str(tmp_ucc_lib_target),
        python_binary_name="python3",
        includes_ui=True,
    )
    expected_requirements_file_path = tmp_path / "lib" / "requirements.txt"
    log_message_expected = (
        f"Could not find requirements file @ "
        f"{str(expected_requirements_file_path)}, nothing to install"
    )
    assert log_message_expected in caplog.text


@mock.patch("subprocess.call", autospec=True)
def test_install_libraries_when_no_splunktaucclib_is_present_but_no_ui(
    mock_subprocess_call,
    tmp_path,
):
    mock_subprocess_call.return_value = 0
    tmp_ucc_lib_target = tmp_path / "ucc-lib-target"
    tmp_lib_path = tmp_path / "lib"
    tmp_lib_path.mkdir()
    tmp_lib_reqs_file = tmp_lib_path / "requirements.txt"
    tmp_lib_reqs_file.write_text("solnlib\nsplunk-sdk\n")

    install_python_libraries(
        str(tmp_path),
        str(tmp_ucc_lib_target),
        python_binary_name="python3",
        includes_ui=False,
    )


def test_install_libraries_when_no_splunktaucclib_is_present_but_has_ui(tmp_path):
    tmp_ucc_lib_target = tmp_path / "ucc-lib-target"
    tmp_lib_path = tmp_path / "lib"
    tmp_lib_path.mkdir()
    tmp_lib_reqs_file = tmp_lib_path / "requirements.txt"
    tmp_lib_reqs_file.write_text("solnlib\nsplunk-sdk\n")

    with pytest.raises(SplunktaucclibNotFound):
        install_python_libraries(
            str(tmp_path),
            str(tmp_ucc_lib_target),
            python_binary_name="python3",
            includes_ui=True,
        )


def test_remove_package_from_installed_path(tmp_path):
    tmp_lib_path = tmp_path / "lib"
    tmp_lib_path.mkdir()
    tmp_lib_path_foo = tmp_lib_path / "foo"
    tmp_lib_path_foo.mkdir()
    tmp_lib_path_foo_dist_info = tmp_lib_path / "foo.dist_info"
    tmp_lib_path_foo_dist_info.mkdir()
    tmp_lib_path_bar = tmp_lib_path / "bar"
    tmp_lib_path_bar.mkdir()
    tmp_lib_path_baz = tmp_lib_path / "baz"
    tmp_lib_path_baz.mkdir()
    tmp_lib_path_qux = tmp_lib_path / "qux.txt"
    tmp_lib_path_qux.write_text("some text")

    remove_package_from_installed_path(
        str(tmp_lib_path),
        ["foo", "bar", "qux"],
    )

    assert not tmp_lib_path_foo.exists()
    assert not tmp_lib_path_foo_dist_info.exists()
    assert not tmp_lib_path_bar.exists()
    assert tmp_lib_path_qux.exists()
    assert tmp_lib_path_baz.exists()


def test_remove_execute_bit(tmp_path):
    tmp_lib_path = tmp_path / "lib"
    tmp_lib_path.mkdir()
    tmp_lib_path_foo = tmp_lib_path / "foo"
    tmp_lib_path_foo.mkdir()
    tmp_lib_path_foo_file = tmp_lib_path_foo / "file.so"
    tmp_lib_path_foo_file.write_text("binary")
    tmp_lib_path_foo_file.chmod(stat.S_IEXEC)
    tmp_lib_path_bar = tmp_lib_path / "bar"
    tmp_lib_path_bar.mkdir()
    tmp_lib_path_bar_file = tmp_lib_path_bar / "file.txt"
    tmp_lib_path_bar_file.write_text("normal")

    remove_execute_bit(
        str(tmp_lib_path),
    )

    assert os.access(tmp_lib_path_foo_file, os.X_OK) is False
    assert os.access(tmp_lib_path_bar_file, os.X_OK) is False
