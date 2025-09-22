#
# Copyright 2025 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import csv
import glob
import logging
import os
import re
import stat
import subprocess
import sys
from pathlib import Path

from packaging.requirements import Requirement, InvalidRequirement
from packaging.version import Version
from typing import List, Optional, Set, Iterable, Dict
from splunk_add_on_ucc_framework.global_config import OSDependentLibraryConfig

logger = logging.getLogger("ucc_gen")


LIBS_REQUIRED_FOR_UI = {"splunktaucclib": "6.6.0"}
LIBS_REQUIRED_FOR_OAUTH = {"solnlib": "5.5.0"}


class SplunktaucclibNotFound(Exception):
    pass


class WrongSplunktaucclibVersion(Exception):
    pass


class WrongSolnlibVersion(Exception):
    pass


class CouldNotInstallRequirements(Exception):
    pass


class InvalidArguments(Exception):
    pass


def _subprocess_run(
    command: str,
    command_desc: Optional[str] = None,
    env: Optional[Dict[str, str]] = None,
) -> "subprocess.CompletedProcess[bytes]":
    command_desc = command_desc or command
    try:
        logger.info(f"Executing: {command}")
        process_result = subprocess.run(
            command, shell=True, env=env, capture_output=True
        )
        return_code = process_result.returncode
        if return_code < 0:
            logger.error(
                f"Child ({command_desc}) was terminated by signal {-return_code}"
            )
        if return_code > 0:
            logger.error(f"Command ({command_desc}) returned {return_code} status code")
        return process_result
    except OSError as e:
        logger.error(f"Execution ({command_desc}) failed due to {e}")
        raise e


def _pip_install(installer: str, command: str, command_desc: str) -> None:
    cmd = f"{installer} -m pip install {command}"
    try:
        subprocess_result = _subprocess_run(command=cmd, command_desc=command_desc)
        return_code = subprocess_result.returncode
        if return_code != 0:
            raise CouldNotInstallRequirements(subprocess_result.stderr.decode())
    except OSError as e:
        raise CouldNotInstallRequirements(e) from e


def _pip_is_lib_installed(
    installer: str,
    target: str,
    libname: str,
    version: Optional[str] = None,
    allow_higher_version: bool = False,
) -> bool:
    if not version and allow_higher_version:
        raise InvalidArguments(
            "Parameter 'allow_higher_version' can not be set to True if 'version' parameter is not provided"
        )

    lib_installed_cmd = f"{installer} -m pip show --version {libname}"

    try:
        my_env = os.environ.copy()
        my_env["PYTHONPATH"] = target

        # Disable writing of .pyc files (__pycache__)
        my_env["PYTHONDONTWRITEBYTECODE"] = "1"

        result = _subprocess_run(command=lib_installed_cmd, env=my_env)
        if result.returncode != 0 or "Version:" not in result.stdout.decode("utf-8"):
            logger.error(
                f"Command result: {result.stdout.decode()} {result.stderr.decode()}"
            )
            return False

        if version:
            pip_show_result = result.stdout.decode("utf-8").splitlines()
            result_row = next(el for el in pip_show_result if el.startswith("Version:"))
            result_version = result_row.split("Version:")[1].strip()
            if allow_higher_version:
                logger.info(
                    f"Command result: {result.stdout.decode()} {result.stderr.decode()}"
                )
                return Version(result_version) >= Version(version)
            return Version(result_version) == Version(version)
        else:
            return result.returncode == 0

    except OSError as exc:
        logger.error(f"Command execution failed with error message: {str(exc)}")
        raise CouldNotInstallRequirements from exc


def _check_libraries_required_for_oauth(
    python_binary_name: str, ucc_lib_target: str, path_to_requirements_file: str
) -> None:
    for lib, version in LIBS_REQUIRED_FOR_OAUTH.items():
        if not _pip_is_lib_installed(
            installer=python_binary_name,
            target=ucc_lib_target,
            libname=lib,
            version=version,
            allow_higher_version=True,
        ):
            raise WrongSolnlibVersion(
                f"{lib} found at {path_to_requirements_file}, but is not of latest version."
                f" Please make sure {lib} is of version greater than or equal to {version}."
            )


def _check_libraries_required_for_ui(
    python_binary_name: str, ucc_lib_target: str, path_to_requirements_file: str
) -> None:
    for lib, version in LIBS_REQUIRED_FOR_UI.items():
        if not _pip_is_lib_installed(
            installer=python_binary_name,
            target=ucc_lib_target,
            libname=lib,
        ):
            raise SplunktaucclibNotFound(
                f"This add-on has an UI, so the {lib} is required but not found in "
                f"{path_to_requirements_file}. Please add it there and make sure it is at least version {version}."
            )
        if not _pip_is_lib_installed(
            installer=python_binary_name,
            target=ucc_lib_target,
            libname=lib,
            version=version,
            allow_higher_version=True,
        ):
            raise WrongSplunktaucclibVersion(
                f"{lib} found but has the wrong version. Please make sure it is at least version {version}."
            )


def parse_excludes(excludes_path: Optional[str]) -> Optional[List[str]]:
    if not excludes_path:
        return None

    if not os.path.isfile(excludes_path):
        return None

    with open(excludes_path) as fp:
        excludes = fp.read()

    # https://pip.pypa.io/en/latest/reference/requirements-file-format/#comments
    comment_start = re.compile(r"\s#")

    excluded_libs = []

    for exclude_str in excludes.splitlines():
        exclude_str = comment_start.split(exclude_str, maxsplit=1)[0].strip()

        if not exclude_str or exclude_str.startswith("#"):
            continue

        try:
            exclude = Requirement(exclude_str)
        except InvalidRequirement:
            raise InvalidArguments(
                f"Exclusion '{exclude_str}' is not a valid requirement."
            )

        if exclude.specifier or exclude.marker or exclude.url or exclude.extras:
            raise InvalidArguments(
                f"Exclusion '{exclude_str}' should not contain a version specifier, marker, URL, or extras."
            )

        excluded_libs.append(str(exclude))

    if not excluded_libs:
        return None

    return excluded_libs


def install_python_libraries(
    source_path: str,
    ucc_lib_target: str,
    python_binary_name: str,
    includes_ui: bool = False,
    os_libraries: Optional[List[OSDependentLibraryConfig]] = None,
    pip_version: str = "latest",
    pip_legacy_resolver: bool = False,
    pip_custom_flag: Optional[str] = None,
    includes_oauth: bool = False,
) -> None:
    path_to_requirements_file = os.path.join(source_path, "lib", "requirements.txt")
    path_to_excludes = os.path.join(source_path, "lib", "exclude.txt")
    excludes = parse_excludes(path_to_excludes)

    if os.path.isfile(path_to_requirements_file):
        logger.info(f"Installing requirements from {path_to_requirements_file}")
        if not os.path.exists(ucc_lib_target):
            os.makedirs(ucc_lib_target)
        install_libraries(
            requirements_file_path=path_to_requirements_file,
            installation_path=ucc_lib_target,
            installer=python_binary_name,
            pip_version=pip_version,
            pip_legacy_resolver=pip_legacy_resolver,
            pip_custom_flag=pip_custom_flag,
        )
        if excludes:
            logger.info(f"Excluding libraries: {', '.join(excludes)}")
            remove_packages(installation_path=ucc_lib_target, package_names=excludes)
        if includes_ui:
            _check_libraries_required_for_ui(
                python_binary_name, ucc_lib_target, path_to_requirements_file
            )
        if includes_oauth:
            _check_libraries_required_for_oauth(
                python_binary_name, ucc_lib_target, path_to_requirements_file
            )

        cleanup_libraries = install_os_dependent_libraries(
            ucc_lib_target=ucc_lib_target,
            installer=python_binary_name,
            os_libraries=os_libraries,
            excludes=excludes,
        )

        packages_to_remove = {
            "setuptools",
            "bin",
            "pip",
            "distribute",
            "wheel",
        }
        # we can remove os-dependent libraries from the installation_path to save some space.
        packages_to_remove.update(cleanup_libraries)
        remove_packages(
            installation_path=ucc_lib_target,
            package_names=packages_to_remove,
        )

        remove_execute_bit(ucc_lib_target)
    else:
        logger.warning(
            f"Could not find requirements file @ {path_to_requirements_file}, nothing to install"
        )


def install_libraries(
    requirements_file_path: str,
    installation_path: str,
    installer: str,
    pip_version: str = "latest",
    pip_legacy_resolver: bool = False,
    pip_custom_flag: Optional[str] = None,
) -> None:
    """
    Upgrades `pip` version to the latest one and installs requirements to the
    specified path.
    """

    if pip_version == "latest":
        pip_update_command = "--upgrade pip"
    else:
        pip_update_command = f"--upgrade pip=={pip_version.strip()}"

    if pip_version.strip() == "23.2" and pip_legacy_resolver:
        logger.error(
            "You cannot use the legacy resolver with pip 23.2. "
            "Please remove '--pip-legacy-resolver' from your build command or "
            "use a different version of pip e.g. 23.2.1"
        )
        sys.exit(1)

    deps_resolver = "--use-deprecated=legacy-resolver " if pip_legacy_resolver else ""
    custom_flag = (
        pip_custom_flag
        if pip_custom_flag
        else "--no-compile --prefer-binary --ignore-installed "
    )
    pip_install_command = (
        f'-r "{requirements_file_path}" '
        f"{deps_resolver}"
        f'--target "{installation_path}" '
        f"{custom_flag}"
    )
    try:
        _pip_install(
            installer=installer, command=pip_update_command, command_desc="pip upgrade"
        )

        _pip_install(
            installer=installer, command=pip_install_command, command_desc="pip install"
        )
    except CouldNotInstallRequirements as exc:
        logger.error(f"Command execution failed with error message: {str(exc)}")
        sys.exit(1)


def determine_record_separator(paths: List[str], dist_info: str) -> str:
    """
    Determines the separator used in RECORD files for the given dist-info directory.
    As Windows can use both '/' and '\' as path separators, we need to check the RECORD files
    to determine which one is used.
    If no RECORD files are found, defaults to '/'.
    """
    dist_info_dir_escaped = re.escape(dist_info)
    record_pattern = re.compile(rf"^{dist_info_dir_escaped}([\\/])RECORD$")

    for path in paths:
        separator_match = record_pattern.match(path)

        if separator_match:
            return separator_match.group(1)

    return "/"


def _remove_package(installation_path: str, package_name: str) -> bool:
    name_sub = re.compile(r"[^\w\d.]+", re.UNICODE)

    # https://peps.python.org/pep-0491/
    def sub(name: str) -> str:
        return name_sub.sub("_", name)

    # RECORD files are located in the *.dist-info directories
    # Example content:
    #     requests-2.32.5.dist-info/INSTALLER,sha256=zuuue4knoyJ-UwPPXg8fezS7VCrXJQrAP7zeNuwvFQg,4
    #     requests-2.32.5.dist-info/METADATA,sha256=ZbWgjagfSRVRPnYJZf8Ut1GPZbe7Pv4NqzZLvMTUDLA,4945
    #     requests-2.32.5.dist-info/RECORD,,
    #     requests/__init__.py,sha256=4xaAERmPDIBPsa2PsjpU9r06yooK-2mZKHTZAhWRWts,5072

    exclude_safe = sub(package_name)
    record_files = os.path.join(
        installation_path, f"{exclude_safe}-*.dist-info", "RECORD"
    )

    is_deleted = False

    for record in glob.glob(record_files):
        top_level_dirs = set()

        dist_info_dir = os.path.basename(os.path.dirname(record))

        with open(record) as fp:
            paths = [line[0] for line in csv.reader(fp)]

        separator = determine_record_separator(paths, dist_info_dir)

        for path in paths:
            if os.path.isabs(path):
                raise ValueError(
                    f"Absolute paths are not allowed in RECORD files: {path}"
                )
            os.remove(os.path.join(installation_path, path))
            top_level_dirs.add(path.split(separator)[0])

        for directory in top_level_dirs:
            for path, _, _ in os.walk(
                os.path.join(installation_path, directory), topdown=False
            ):
                if not os.listdir(path):
                    os.rmdir(path)

        deleted_folders = set()
        not_deleted_folders = set()

        for folder in top_level_dirs:
            if os.path.isdir(os.path.join(installation_path, folder)):
                not_deleted_folders.add(folder)
            else:
                deleted_folders.add(folder)

        deleted_folders_str = ", ".join(
            f"{folder} (deleted)" for folder in deleted_folders
        )
        not_deleted_folders_str = ", ".join(
            f"{folder} (not deleted)" for folder in not_deleted_folders
        )

        logger.info(
            "Excluded package %s with directories: %s",
            package_name,
            ", ".join((deleted_folders_str, not_deleted_folders_str)),
        )
        is_deleted = True

    return is_deleted


def remove_packages(installation_path: str, package_names: Iterable[str]) -> None:
    package_names = set(package_names)

    logger.info(f"Removing {len(package_names)} package(s): {', '.join(package_names)}")

    successful_removes = set()

    for package_name in package_names:
        if _remove_package(installation_path, package_name):
            successful_removes.add(package_name)

    remaining_packages = package_names - successful_removes

    if remaining_packages:
        logger.info(
            f"Could not find directories for {len(remaining_packages)} packages(s) to delete: "
            f"{', '.join(remaining_packages)}"
        )


def remove_execute_bit(installation_path: str) -> None:
    p = Path(installation_path)
    no_user_exec = ~stat.S_IEXEC
    no_group_exec = ~stat.S_IXGRP
    no_other_exec = ~stat.S_IXOTH
    no_exec = no_user_exec & no_group_exec & no_other_exec

    for o in p.rglob("*"):
        if not o.is_dir() and os.access(o, os.X_OK):
            logger.info(f"  fixing {o} execute bit")
            current_permissions = stat.S_IMODE(os.lstat(o).st_mode)
            os.chmod(o, current_permissions & no_exec)


def install_os_dependent_libraries(
    ucc_lib_target: str,
    installer: str,
    os_libraries: Optional[List[OSDependentLibraryConfig]],
    excludes: Optional[List[str]] = None,
) -> Set[str]:
    cleanup_libraries: Set[str] = set()

    if not os_libraries:
        logger.info("No os-dependentLibraries to install.")
        return cleanup_libraries

    logger.info("Installing os-dependentLibraries.")

    validate_conflicting_paths(os_libraries)
    for os_lib in os_libraries:
        if os_lib.dependencies is False and not _pip_is_lib_installed(
            installer=installer,
            target=ucc_lib_target,
            libname=os_lib.name,
            version=os_lib.version,
        ):
            logger.error(
                f"""
OS dependent library {os_lib.name} = {os_lib.version} SHOULD be defined in requirements.txt.
When the os dependent library is installed without its dependencies it has to be listed in requirements.txt.
Possible solutions, either:
1. os-dependentLibraries.name[{os_lib.name}].dependencies = True
2. Add {os_lib.name}=={os_lib.version} in requirements.txt
"""
            )
            raise CouldNotInstallRequirements

        target_path = os.path.join(ucc_lib_target, os.path.normpath(os_lib.target))
        if not os.path.exists(target_path):
            os.makedirs(target_path)

        pip_download_command = (
            f"{os_lib.deps_flag} "
            f"--no-compile "
            f"--platform {os_lib.platform} "
            f"--python-version {os_lib.python_version} "
            f"--target {target_path}"
            f" --only-binary=:all: "
            f"{os_lib.name}=={os_lib.version} "
            f"{os_lib.ignore_requires_python} "
        )

        try:
            _pip_install(
                installer=installer,
                command=pip_download_command,
                command_desc="pip download",
            )
        except CouldNotInstallRequirements as exc:
            logger.error(
                "Downloading process failed. Please verify parameters in the globalConfig.json file."
            )
            sys.exit(f"Package build aborted with error message: {str(exc)}")
        cleanup_libraries.add(os_lib.name)
    return cleanup_libraries


def validate_conflicting_paths(libs: List[OSDependentLibraryConfig]) -> bool:
    name_target_pairs = [(lib.name, lib.target) for lib in libs]
    conflicts = {x for x in name_target_pairs if name_target_pairs.count(x) > 1}
    if conflicts:
        logger.error(
            f"Found conflicting paths for libraries: {conflicts}. "
            "Please make sure that the paths are unique."
        )
        raise CouldNotInstallRequirements
    return True
