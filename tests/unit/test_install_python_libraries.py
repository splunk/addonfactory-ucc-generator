import glob
import os
import shutil
import stat
import subprocess
import sys
from collections import namedtuple
from pathlib import Path
from textwrap import dedent
from typing import Optional
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
    WrongSolnlibVersion,
    InvalidArguments,
    _pip_is_lib_installed,
    parse_excludes,
    determine_record_separator,
)

from splunk_add_on_ucc_framework import global_config as gc


class MockSubprocessResult:
    def __init__(self, returncode, stdout=b"", stderr=b""):
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr


@pytest.fixture
def packages(tmp_path):
    VERSION = "1.0.0"

    def create_pkg(
        name: str,
        version: str = VERSION,
        dependency: Optional[str] = None,
        module_dir: Optional[str] = None,
    ) -> str:
        pkg_dir = tmp_path / name
        pkg_dir.mkdir()
        module_path = pkg_dir

        if module_dir:
            module_path = module_path / module_dir

        module_path = module_path / name
        module_path.mkdir(parents=True)

        (module_path / "submodule").mkdir(parents=True)
        (module_path / "submodule" / "__init__.py").write_text("")
        (module_path / "submodule" / "other.py").write_text("")
        (module_path / "__init__.py").write_text("")
        pyproject = dedent(
            f"""
                    [build-system]
                    requires = ["setuptools>=61", "wheel"]
                    build-backend = "setuptools.build_meta"

                    [project]
                    name = "{name}"
                    version = "{version}"
                    dependencies = [{f'"{dependency}"' if dependency else ''}]
                """.lstrip()
        )
        (pkg_dir / "pyproject.toml").write_text(pyproject)
        subprocess.run(
            f"{sys.executable} -m pip wheel --wheel {tmp_path} {pkg_dir}",
            check=True,
            shell=True,
        )
        shutil.rmtree(str(pkg_dir))
        return glob.glob(f"{tmp_path}/{name}-*")[0]

    pkg1 = create_pkg("test_pkg_1", module_dir="pkg_1_plus_2")
    pkg2 = create_pkg(
        "test_pkg_2",
        dependency=f"test_pkg_1 @ file://{pkg1}",
        module_dir="pkg_1_plus_2",
    )
    pkg3 = create_pkg("test_pkg_3", dependency=f"test_pkg_2 @ file://{pkg2}")
    pkg4 = create_pkg("test_pkg_4", dependency=f"test_pkg_3 @ file://{pkg3}")

    return {
        "test_pkg_1": pkg1,
        "test_pkg_2": pkg2,
        "test_pkg_3": pkg3,
        "test_pkg_4": pkg4,
    }


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
def test_install_libraries_when_subprocess_raises_os_error(mock_subprocess_run, caplog):
    mock_subprocess_run.side_effect = OSError("Test error message")
    expected_output1 = "Command execution failed with error message: Test error message"
    expected_output2 = "Execution (pip upgrade) failed due to Test error message"

    with pytest.raises(SystemExit):
        install_libraries(
            "package/lib/requirements.txt", "/path/to/output/addon_name/lib", "python3"
        )
    assert expected_output1 in caplog.text
    assert expected_output2 in caplog.text


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
    statuses = []
    for el in subprocess_status_codes:
        statuses.append(MockSubprocessResult(el))
    mock_subprocess_run.side_effect = statuses

    with pytest.raises(SystemExit):
        install_libraries(
            "package/lib/requirements.txt", "/path/to/output/addon_name/lib", "python3"
        )


@mock.patch("subprocess.run", autospec=True)
def test_install_libraries_failed_stderr_msg(mock_subprocess_run, caplog):
    statuses = [
        MockSubprocessResult(0),
        MockSubprocessResult(-1, stderr=b"No matching distribution for python 3.7"),
    ]
    mock_subprocess_run.side_effect = statuses
    expected_msg = "Command execution failed with error message: No matching distribution for python 3.7"

    with pytest.raises(SystemExit):
        install_libraries(
            "package/lib/requirements.txt", "/path/to/output/addon_name/lib", "python3"
        )
    assert expected_msg in caplog.text


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


def test_install_libraries_when_no_splunktaucclib_is_present_but_has_ui(
    tmp_path, caplog
):
    tmp_ucc_lib_target = tmp_path / "ucc-lib-target"
    tmp_lib_path = tmp_path / "lib"
    tmp_lib_path.mkdir()
    tmp_lib_reqs_file = tmp_lib_path / "requirements.txt"
    tmp_lib_reqs_file.write_text("solnlib\nsplunk-sdk\n")

    expected_msg = (
        f"This add-on has an UI, so the splunktaucclib is required but not found in {tmp_lib_reqs_file}. "
        f"Please add it there and make sure it is at least version 6.6.0."
    )

    expected_caplog = "Command result:  WARNING: Package(s) not found: splunktaucclib"

    with pytest.raises(SplunktaucclibNotFound) as exc:
        install_python_libraries(
            source_path=str(tmp_path),
            ucc_lib_target=str(tmp_ucc_lib_target),
            python_binary_name="python3",
            includes_ui=True,
        )
    assert expected_msg in str(exc.value)
    assert expected_caplog in caplog.text


def test_install_libraries_when_wrong_splunktaucclib_is_present_but_has_ui(
    tmp_path, caplog
):
    tmp_ucc_lib_target = tmp_path / "ucc-lib-target"
    tmp_lib_path = tmp_path / "lib"
    tmp_lib_path.mkdir()
    tmp_lib_reqs_file = tmp_lib_path / "requirements.txt"
    tmp_lib_reqs_file.write_text("splunktaucclib==6.3\n")

    expected_msg = "splunktaucclib found but has the wrong version. Please make sure it is at least version 6.6.0."
    expected_caplog = "Command result: Name: splunktaucclib\nVersion: 6.3.0"

    with pytest.raises(WrongSplunktaucclibVersion) as exc:
        install_python_libraries(
            str(tmp_path),
            str(tmp_ucc_lib_target),
            python_binary_name="python3",
            includes_ui=True,
        )
    assert expected_msg in str(exc.value)
    assert expected_caplog in caplog.text


def test_install_libraries_when_wrong_solnlib_is_present_but_has_oauth(tmp_path):
    tmp_ucc_lib_target = tmp_path / "ucc-lib-target"
    tmp_lib_path = tmp_path / "lib"
    tmp_lib_path.mkdir()
    tmp_lib_reqs_file = tmp_lib_path / "requirements.txt"
    tmp_lib_reqs_file.write_text("solnlib==5.4.0\n")

    expected_msg = (
        f"solnlib found at {tmp_lib_reqs_file}, but is not of latest version. "
        "Please make sure solnlib is of version greater than or equal to 5.5.0"
    )

    with pytest.raises(WrongSolnlibVersion) as exc:
        install_python_libraries(
            str(tmp_path),
            str(tmp_ucc_lib_target),
            python_binary_name="python3",
            includes_oauth=True,
        )
    assert expected_msg in str(exc.value)


def test_remove_package_from_installed_path(tmp_path):
    def make_module(
        lib: Path,
        module_name: str,
        module_top: Optional[str] = None,
        additional_records: Optional[list[str]] = None,
    ) -> tuple[Path, Path]:
        module_top = module_top or module_name
        additional_records = additional_records or []

        if module_top.endswith(".py"):
            (lib / module_top).write_text("")
            module_record = module_top
        else:
            (lib / module_top).mkdir(parents=True, exist_ok=True)
            (lib / module_top / "__init__.py").write_text("")
            module_record = f"{module_top}/__init__.py"

        dist_info = f"{module_name}-1.0.0.dist-info"
        (lib / dist_info).mkdir(parents=True, exist_ok=True)
        (lib / dist_info / "RECORD").write_text(
            f"{module_record},sha256=xyz,123\n"
            f"{dist_info}/RECORD,sha256=xyz,123\n"
            + "\n".join(f"{rec},sha256=xyz,123" for rec in additional_records)
        )

        return lib / module_top, lib / dist_info

    tmp_lib_path = tmp_path / "lib"

    foo_module, foo_dist_info = make_module(tmp_lib_path, "foo")
    bar_module, bar_dist_info = make_module(tmp_lib_path, "bar", "bar_dir")
    baz_module, baz_dist_info = make_module(tmp_lib_path, "baz")
    qux_module, qux_dist_info = make_module(tmp_lib_path, "qux", "qux.py")

    assert foo_module.is_dir()
    assert foo_dist_info.exists()
    assert bar_module.is_dir()
    assert bar_dist_info.exists()
    assert baz_module.is_dir()
    assert baz_dist_info.exists()
    assert qux_module.is_file()
    assert qux_dist_info.exists()

    remove_packages(
        str(tmp_lib_path),
        ["foo", "bar", "qux"],
    )

    assert not foo_module.is_dir()
    assert not foo_dist_info.exists()
    assert not bar_module.is_dir()
    assert not bar_dist_info.exists()
    assert baz_module.is_dir()
    assert baz_dist_info.exists()
    assert not qux_module.is_file()
    assert not qux_dist_info.exists()

    with pytest.raises(ValueError) as exc:
        make_module(tmp_lib_path, "xyz", additional_records=["/absolute/path.py"])
        remove_packages(
            str(tmp_lib_path),
            ["xyz"],
        )

    assert "Absolute paths are not allowed in RECORD files" in str(exc.value)


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
    global_config = gc.GlobalConfig.from_file(global_config_path)

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


@mock.patch(
    "subprocess.run", autospec=True, side_effect=OSError("test oserror message")
)
def test_is_pip_lib_installed_oserror(sub_process_mock, caplog):
    expected_msg = "Command execution failed with error message: test oserror message"
    with pytest.raises(CouldNotInstallRequirements):
        _pip_is_lib_installed("i", "t", "l")
    assert expected_msg in caplog.text


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
    global_config = gc.GlobalConfig.from_file(global_config_path)
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
        "python3 -m pip install "
        "--no-deps "
        "--no-compile "
        "--platform win_amd64 "
        "--python-version 37 "
        f"--target {tmp_ucc_lib_target}/3rdparty/windows "
        "--only-binary=:all: cryptography==41.0.5  \nINFO"
    )

    log_message_expected_2 = (
        "python3 -m pip install  "
        "--no-compile "
        "--platform manylinux2014_x86_64 "
        "--python-version 37 "
        f"--target {tmp_ucc_lib_target}/3rdparty/linux "
        "--only-binary=:all: cryptography==41.0.5 "
        "--ignore-requires-python "
    )

    log_message_expected_3 = (
        "python3 -m pip install "
        "--no-deps "
        "--no-compile "
        "--platform macosx_10_12_universal2 "
        "--python-version 37 "
        f"--target {tmp_ucc_lib_target}/3rdparty/darwin "
        "--only-binary=:all: cryptography==41.0.5  \nINFO"
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
    global_config = gc.GlobalConfig.from_file(global_config_path)

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
    libs: list[OSDependentLibraryConfig] = [
        os_dependent_library_config(name="lib1", target="path1"),
        os_dependent_library_config(name="lib2", target="path2"),
    ]
    assert validate_conflicting_paths(libs)


def test_validate_conflicting_paths_with_conflict(os_dependent_library_config, caplog):
    libs: list[OSDependentLibraryConfig] = [
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
    libs: list[OSDependentLibraryConfig] = []
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


def test_parse_excludes(tmp_path):
    def assert_excludes(content: str, asserted: Optional[list[str]]) -> None:
        exclude_path = tmp_path / "exclude.txt"
        exclude_path.write_text(content)
        assert parse_excludes(str(exclude_path)) == asserted

    assert parse_excludes(None) is None
    assert parse_excludes(str(tmp_path / "file_that_does_not_exist.txt")) is None
    assert_excludes("", None)
    assert_excludes("   \n\n\t", None)
    assert_excludes("# comments\n# only", None)

    assert_excludes("pkg1", ["pkg1"])
    assert_excludes(" pkg1 ", ["pkg1"])
    assert_excludes("pkg1 # comment", ["pkg1"])

    assert_excludes(
        dedent(
            """
            # comments
            pkg1
            pkg2
            # another comment
            pkg3 # with comment
            """.lstrip()
        ),
        ["pkg1", "pkg2", "pkg3"],
    )


def test_parse_excludes_invalid(tmp_path):
    def parse_excludes_from_str(content: str) -> Optional[list[str]]:
        exclude_path = tmp_path / "exclude.txt"
        exclude_path.write_text(content)
        return parse_excludes(str(exclude_path))

    for content in ("a\nb d", "a#b", "!@#$%"):
        with pytest.raises(InvalidArguments):
            parse_excludes_from_str(content)

    for content in ("pkg==1", "pkg>=1.0", "pkg<=2.0", "pkg>1.0", "pkg<2.0", "pkg~=1.4"):
        with pytest.raises(InvalidArguments):
            parse_excludes_from_str(content)


def test_determine_record_separator():
    assert determine_record_separator([], "foo-1.0.0.dist-info") == "/"
    assert determine_record_separator(["some/path"], "foo-1.0.0.dist-info") == "/"
    assert (
        determine_record_separator(
            ["foo-1.0.0.dist-info/RECORD"], "foo-1.0.0.dist-info"
        )
        == "/"
    )
    assert (
        determine_record_separator(
            ["aaaa", "foo-1.0.0.dist-info/RECORD"], "foo-1.0.0.dist-info"
        )
        == "/"
    )
    assert (
        determine_record_separator(
            ["foo-1.0.0.dist-info\\RECORD"], "foo-1.0.0.dist-info"
        )
        == "\\"
    )
    assert (
        determine_record_separator(
            ["aaa", "foo-1.0.0.dist-info\\RECORD"], "foo-1.0.0.dist-info"
        )
        == "\\"
    )


def test_install_python_libraries_no_mocks_without_excludes(tmp_path, packages):
    VERSION = "1.0.0"

    target = tmp_path / "target"
    package = tmp_path / "package"
    lib = package / "lib"
    lib.mkdir(parents=True)

    (lib / "requirements.txt").write_text(
        "test_pkg_4 @ file://" + packages["test_pkg_4"]
    )

    install_python_libraries(
        source_path=str(package),
        ucc_lib_target=str(target),
        python_binary_name=sys.executable,
    )

    # all packages should be installed, as there are no excludes
    for number in (3, 4):
        package_name = f"test_pkg_{number}"
        assert glob.glob(f"{target}/{package_name}-{VERSION}.dist-info")
        assert glob.glob(f"{target}/{package_name}")

    for number in (1, 2):
        package_name = f"test_pkg_{number}"
        assert glob.glob(f"{target}/{package_name}-{VERSION}.dist-info")
        assert glob.glob(f"{target}/pkg_1_plus_2/{package_name}")


def test_install_python_libraries_no_mocks_with_excludes(tmp_path, packages):
    VERSION = "1.0.0"

    target = tmp_path / "target"
    package = tmp_path / "package"
    lib = package / "lib"
    lib.mkdir(parents=True)

    (lib / "requirements.txt").write_text(
        "test_pkg_4 @ file://" + packages["test_pkg_4"]
    )

    # Exclude test_pkg_2 and a non-existing package
    (lib / "exclude.txt").write_text("test_pkg_2\nnon_existing_pkg\n")

    install_python_libraries(
        source_path=str(package),
        ucc_lib_target=str(target),
        python_binary_name=sys.executable,
    )

    for number in (1, 3, 4):
        package_name = f"test_pkg_{number}"
        assert glob.glob(f"{target}/{package_name}-{VERSION}.dist-info")

    # pkg2 is excluded
    assert not glob.glob(f"{target}/test_pkg_2-{VERSION}.dist-info")

    assert glob.glob(f"{target}/pkg_1_plus_2/test_pkg_1")
    assert not glob.glob(f"{target}/pkg_1_plus_2/test_pkg_2")
