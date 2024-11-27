import os
import stat
from collections import namedtuple
from typing import List
from unittest import mock

import pytest

import tests.unit.helpers as helpers
from splunk_add_on_ucc_framework.global_config import OSDependentLibraryConfig

from splunk_add_on_ucc_framework import (
    install_python_libraries as install_python_libraries_module,
)
from splunk_add_on_ucc_framework.install_python_libraries import (
    CouldNotInstallRequirements,
    SplunktaucclibNotFound,
    install_libraries,
    install_python_libraries,
    remove_execute_bit,
    remove_packages,
    validate_conflicting_paths,
    WrongSplunktaucclibVersion,
    InvalidArguments,
    _pip_is_lib_installed,
)

from splunk_add_on_ucc_framework import global_config as gc


class MockSubprocessResult:
    def __init__(self, returncode, stdout=b""):
        self.returncode = returncode
        self.stdout = stdout


@mock.patch("subprocess.run", autospec=True)
def test_install_libraries(mock_subprocess_run):
    mock_subprocess_run.return_value = MockSubprocessResult(0)

    install_libraries(
        "package/lib/requirements.txt",
        "/path/to/output/addon_name/lib",
        "python3",
    )

    expected_install_command = (
        'python3 -m pip install -r "package/lib/requirements.txt"'
        ' --target "/path/to/output/addon_name/lib" '
        "--no-compile --prefer-binary --ignore-installed "
    )
    expected_pip_update_command = "python3 -m pip install --upgrade pip"
    mock_subprocess_run.assert_has_calls(
        [
            mock.call(
                expected_pip_update_command, shell=True, env=None, capture_output=True
            ),
            mock.call(
                expected_install_command, shell=True, env=None, capture_output=True
            ),
        ]
    )


@mock.patch("subprocess.run", autospec=True)
def test_install_libraries_when_subprocess_raises_os_error(mock_subprocess_run):
    mock_subprocess_run.side_effect = OSError

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
@mock.patch("subprocess.run", autospec=True)
def test_install_libraries_when_subprocess_returns_non_zero_codes(
    mock_subprocess_run,
    subprocess_status_codes,
):
    statuses = (MockSubprocessResult(el) for el in subprocess_status_codes)
    mock_subprocess_run.side_effect = statuses

    with pytest.raises(CouldNotInstallRequirements):
        install_libraries(
            "package/lib/requirements.txt", "/path/to/output/addon_name/lib", "python3"
        )


def test_install_python_libraries(tmp_path):
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


@mock.patch("subprocess.run", autospec=True)
def test_install_libraries_when_no_splunktaucclib_is_present_but_no_ui(
    mock_subprocess_run,
    tmp_path,
):
    mock_subprocess_run.return_value = MockSubprocessResult(0)
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

    expected_msg = (
        f"This add-on has an UI, so the splunktaucclib is required but not found in {tmp_lib_reqs_file}. "
        f"Please add it there and make sure it is at least version 6.4.0."
    )

    with pytest.raises(SplunktaucclibNotFound) as exc:
        install_python_libraries(
            str(tmp_path),
            str(tmp_ucc_lib_target),
            python_binary_name="python3",
            includes_ui=True,
        )
    assert expected_msg in str(exc.value)


def test_install_libraries_when_wrong_splunktaucclib_is_present_but_has_ui(tmp_path):
    tmp_ucc_lib_target = tmp_path / "ucc-lib-target"
    tmp_lib_path = tmp_path / "lib"
    tmp_lib_path.mkdir()
    tmp_lib_reqs_file = tmp_lib_path / "requirements.txt"
    tmp_lib_reqs_file.write_text("splunktaucclib==6.3\n")

    expected_msg = "splunktaucclib found but has the wrong version. Please make sure it is at least version 6.4.0."

    with pytest.raises(WrongSplunktaucclibVersion) as exc:
        install_python_libraries(
            str(tmp_path),
            str(tmp_ucc_lib_target),
            python_binary_name="python3",
            includes_ui=True,
        )
    assert expected_msg in str(exc.value)


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

    remove_packages(
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


@mock.patch("subprocess.run", autospec=True)
@mock.patch(
    "splunk_add_on_ucc_framework.install_python_libraries.install_libraries",
    autospec=True,
)
def test_install_python_libraries_invalid_os_libraries(
    install_libraries, mock_subprocess_run, caplog, tmp_path
):
    mock_subprocess_run.return_value = MockSubprocessResult(1)
    install_libraries.return_value = True
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_with_invalid_os_libraries.json"
    )
    global_config = gc.GlobalConfig(global_config_path)

    tmp_ucc_lib_target = tmp_path / "ucc-lib-target"
    tmp_lib_path = tmp_path / "lib"
    tmp_lib_path.mkdir()
    tmp_lib_reqs_file = tmp_lib_path / "requirements.txt"
    tmp_lib_reqs_file.write_text("splunktaucclib\n")

    with pytest.raises(CouldNotInstallRequirements):
        install_python_libraries(
            str(tmp_path),
            str(tmp_ucc_lib_target),
            python_binary_name="python3",
            os_libraries=global_config.os_libraries,
        )


@mock.patch("subprocess.run", autospec=True)
@mock.patch(
    "splunk_add_on_ucc_framework.install_python_libraries.remove_packages",
    autospec=True,
)
def test_install_libraries_valid_os_libraries(
    mock_remove_packages,
    mock_subprocess_run,
    caplog,
    tmp_path,
):
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_with_os_libraries.json"
    )
    global_config = gc.GlobalConfig(global_config_path)
    mock_subprocess_run.side_effect = [
        MockSubprocessResult(0),  # mock subprocess.run from _pip_install
        MockSubprocessResult(0),  # mock subprocess.run from _pip_install
        MockSubprocessResult(
            0, b"Version: 41.0.5"
        ),  # mock subprocess.run from _pip_is_lib_installed
        MockSubprocessResult(0),  # mock subprocess.run from _pip_install
        MockSubprocessResult(
            0, b"Version: 41.0.5"
        ),  # mock subprocess.run from _pip_is_lib_installed
        MockSubprocessResult(0),  # mock subprocess.run from _pip_install
        MockSubprocessResult(
            0, b"Version: 1.5.1"
        ),  # mock subprocess.run from _pip_is_lib_installed
        MockSubprocessResult(0),  # mock subprocess.run from _pip_install
        MockSubprocessResult(0),  # mock subprocess.run from _pip_install
    ]
    tmp_ucc_lib_target = tmp_path / "ucc-lib-target"
    tmp_lib_path = tmp_path / "lib"
    tmp_lib_path.mkdir()
    tmp_lib_reqs_file = tmp_lib_path / "requirements.txt"
    tmp_lib_reqs_file.write_text("splunktaucclib\n")

    install_python_libraries(
        str(tmp_path),
        str(tmp_ucc_lib_target),
        python_binary_name="python3",
        os_libraries=global_config.os_libraries,
    )

    log_message_expected_1 = (
        f"python3 -m pip install "
        f"--no-deps "
        f"--no-compile "
        f"--platform win_amd64 "
        f"--python-version 37 "
        f"--target {tmp_ucc_lib_target}/3rdparty/windows "
        f"--only-binary=:all: cryptography==41.0.5"
    )

    log_message_expected_2 = (
        f"python3 -m pip install  "
        f"--no-compile "
        f"--platform manylinux2014_x86_64 "
        f"--python-version 37 "
        f"--target {tmp_ucc_lib_target}/3rdparty/linux "
        f"--only-binary=:all: cryptography==41.0.5"
    )

    log_message_expected_3 = (
        f"python3 -m pip install "
        f"--no-deps "
        f"--no-compile "
        f"--platform macosx_10_12_universal2 "
        f"--python-version 37 "
        f"--target {tmp_ucc_lib_target}/3rdparty/darwin "
        f"--only-binary=:all: cryptography==41.0.5"
    )

    assert log_message_expected_1 in caplog.text
    assert log_message_expected_2 in caplog.text
    assert log_message_expected_3 in caplog.text
    assert os.path.isdir(f"{tmp_ucc_lib_target}/3rdparty/windows") is True
    assert os.path.isdir(f"{tmp_ucc_lib_target}/3rdparty/linux") is True
    assert os.path.isdir(f"{tmp_ucc_lib_target}/3rdparty/darwin") is True

    mock_remove_packages.assert_called_once_with(
        installation_path=str(tmp_ucc_lib_target),
        package_names={
            "setuptools",
            "bin",
            "pip",
            "distribute",
            "wheel",
            "cryptography",
            "cffi",
        },
    )


@mock.patch("subprocess.run", autospec=True)
@mock.patch(
    "splunk_add_on_ucc_framework.install_python_libraries.remove_packages",
    autospec=True,
)
def test_install_libraries_version_mismatch(
    mock_remove_packages,
    mock_subprocess_run,
    caplog,
    tmp_path,
):
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_with_os_libraries.json"
    )
    global_config = gc.GlobalConfig(global_config_path)

    tmp_ucc_lib_target = tmp_path / "ucc-lib-target"
    ucc_lib_target = str(tmp_ucc_lib_target)
    tmp_lib_path = tmp_path / "lib"
    tmp_lib_path.mkdir()
    tmp_lib_reqs_file = tmp_lib_path / "requirements.txt"
    tmp_lib_reqs_file.write_text("splunktaucclib\n")

    version_mismatch_shell_cmd = "python3 -m pip show --version cryptography"
    mock_subprocess_run.side_effect = (
        lambda command, shell=True, env=None, capture_output=True: (
            MockSubprocessResult(1)
            if command == version_mismatch_shell_cmd
            and ucc_lib_target == env["PYTHONPATH"]
            else MockSubprocessResult(0, b"Version: 40.0.0")
        )
    )

    with pytest.raises(CouldNotInstallRequirements):
        install_python_libraries(
            source_path=str(tmp_path),
            ucc_lib_target=ucc_lib_target,
            python_binary_name="python3",
            os_libraries=global_config.os_libraries,
        )

    version_mismatch_log = (
        f"Command ({version_mismatch_shell_cmd}) returned 1 status code"
    )
    error_description = """
OS dependent library cryptography = 41.0.5 SHOULD be defined in requirements.txt.
When the os dependent library is installed without its dependencies it has to be listed in requirements.txt.
Possible solutions, either:
1. os-dependentLibraries.name[cryptography].dependencies = True
2. Add cryptography==41.0.5 in requirements.txt
"""

    assert version_mismatch_log in caplog.messages
    assert error_description in caplog.messages
    mock_remove_packages.assert_not_called()


@mock.patch("subprocess.run", autospec=True)
def test_install_libraries_custom_pip(mock_subprocess_run):
    mock_subprocess_run.return_value = MockSubprocessResult(0)

    install_libraries(
        "package/lib/requirements.txt",
        "/path/to/output/addon_name/lib",
        "python3",
        pip_version="21.666.666",
    )

    expected_install_command = (
        'python3 -m pip install -r "package/lib/requirements.txt"'
        ' --target "/path/to/output/addon_name/lib" '
        "--no-compile --prefer-binary --ignore-installed "
    )
    expected_pip_update_command = "python3 -m pip install --upgrade pip==21.666.666"
    mock_subprocess_run.assert_has_calls(
        [
            mock.call(
                expected_pip_update_command, shell=True, env=None, capture_output=True
            ),
            mock.call(
                expected_install_command, shell=True, env=None, capture_output=True
            ),
        ]
    )


@mock.patch("subprocess.run", autospec=True)
def test_install_libraries_legacy_resolver(mock_subprocess_run):
    mock_subprocess_run.return_value = MockSubprocessResult(0)

    install_libraries(
        "package/lib/requirements.txt",
        "/path/to/output/addon_name/lib",
        "python3",
        pip_legacy_resolver=True,
    )

    expected_install_command = (
        'python3 -m pip install -r "package/lib/requirements.txt"'
        ' --use-deprecated=legacy-resolver --target "/path/to/output/addon_name/lib" '
        "--no-compile --prefer-binary --ignore-installed "
    )
    expected_pip_update_command = "python3 -m pip install --upgrade pip"
    mock_subprocess_run.assert_has_calls(
        [
            mock.call(
                expected_pip_update_command, shell=True, env=None, capture_output=True
            ),
            mock.call(
                expected_install_command, shell=True, env=None, capture_output=True
            ),
        ]
    )


def test_install_libraries_legacy_resolver_with_wrong_pip(caplog):
    with pytest.raises(SystemExit):
        install_libraries(
            "package/lib/requirements.txt",
            "/path/to/output/addon_name/lib",
            "python3",
            pip_version=" 23.2   ",
            pip_legacy_resolver=True,
        )
    expected_msg = (
        "You cannot use the legacy resolver with pip 23.2. "
        "Please remove '--pip-legacy-resolver' from your build command or use a different version of pip e.g. 23.2.1"
    )
    assert expected_msg in caplog.text


def test_validate_conflicting_paths_no_conflict(os_dependent_library_config):
    libs: List[OSDependentLibraryConfig] = [
        os_dependent_library_config(name="lib1", target="path1"),
        os_dependent_library_config(name="lib2", target="path2"),
    ]
    assert validate_conflicting_paths(libs)


def test_validate_conflicting_paths_with_conflict(os_dependent_library_config, caplog):
    libs: List[OSDependentLibraryConfig] = [
        os_dependent_library_config(name="lib1", target="path1"),
        os_dependent_library_config(name="lib1", target="path1"),
        os_dependent_library_config(name="lib1", target="path2"),
        os_dependent_library_config(name="lib2", target="path2"),
        os_dependent_library_config(name="lib3", target="path2"),
        os_dependent_library_config(name="lib3", target="path2"),
    ]
    with pytest.raises(CouldNotInstallRequirements):
        validate_conflicting_paths(libs)

    assert "('lib1', 'path1')" in caplog.text
    assert "('lib3', 'path2')" in caplog.text
    assert "('lib2', 'path2')" not in caplog.text


def test_validate_conflicting_paths_empty_list():
    libs: List[OSDependentLibraryConfig] = []
    assert validate_conflicting_paths(libs)


def test_is_pip_lib_installed_wrong_arguments():
    with pytest.raises(InvalidArguments):
        _pip_is_lib_installed("i", "t", "l", allow_higher_version=True)


def test_is_pip_lib_installed_do_not_write_bytecode(monkeypatch):
    Result = namedtuple("Result", ["returncode", "stdout", "stderr"])

    def run(command, env):
        assert command == "python3 -m pip show --version libname"
        assert env["PYTHONPATH"] == "target"
        assert env["PYTHONDONTWRITEBYTECODE"] == "1"
        return Result(0, b"Version: 1.0.0", b"")

    monkeypatch.setattr(install_python_libraries_module, "_subprocess_run", run)
    assert _pip_is_lib_installed("python3", "target", "libname")


@mock.patch("subprocess.run", autospec=True)
def test_install_libraries_pip_custom_flag(mock_subprocess_run):
    mock_subprocess_run.return_value = MockSubprocessResult(0)

    install_libraries(
        "package/lib/requirements.txt",
        "/path/to/output/addon_name/lib",
        "python3",
        pip_custom_flag="--report path/to/json.json",
    )

    expected_install_command = (
        'python3 -m pip install -r "package/lib/requirements.txt"'
        ' --target "/path/to/output/addon_name/lib" --report path/to/json.json'
    )
    expected_pip_update_command = "python3 -m pip install --upgrade pip"
    mock_subprocess_run.assert_has_calls(
        [
            mock.call(
                expected_pip_update_command, shell=True, env=None, capture_output=True
            ),
            mock.call(
                expected_install_command, shell=True, env=None, capture_output=True
            ),
        ]
    )


@mock.patch("subprocess.run", autospec=True)
def test_install_libraries_multiple_pip_custom_flags(mock_subprocess_run):
    mock_subprocess_run.return_value = MockSubprocessResult(0)

    install_libraries(
        "package/lib/requirements.txt",
        "/path/to/output/addon_name/lib",
        "python3",
        pip_custom_flag="--no-compile --prefer-binary --ignore-installed "
        "--report path/to/json.json --progress-bar on --require-hashes",
    )

    expected_install_command = (
        'python3 -m pip install -r "package/lib/requirements.txt"'
        ' --target "/path/to/output/addon_name/lib" --no-compile --prefer-binary --ignore-installed '
        "--report path/to/json.json --progress-bar on --require-hashes"
    )
    expected_pip_update_command = "python3 -m pip install --upgrade pip"
    mock_subprocess_run.assert_has_calls(
        [
            mock.call(
                expected_pip_update_command, shell=True, env=None, capture_output=True
            ),
            mock.call(
                expected_install_command, shell=True, env=None, capture_output=True
            ),
        ]
    )
