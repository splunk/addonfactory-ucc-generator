#
# Copyright 2024 Splunk Inc.
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
import logging
import os
import shutil
import stat
import subprocess
import sys
from pathlib import Path
from typing import List, Optional, Set, Iterable, Dict
from splunk_add_on_ucc_framework.global_config import OSDependentLibraryConfig

logger = logging.getLogger("ucc_gen")


class SplunktaucclibNotFound(Exception):
    pass


class CouldNotInstallRequirements(Exception):
    pass


def _subprocess_call(
    command: str,
    command_desc: Optional[str] = None,
    env: Optional[Dict[str, str]] = None,
) -> int:
    command_desc = command_desc or command
    try:
        logger.info(f"Executing: {command}")
        return_code = subprocess.call(command, shell=True, env=env)
        if return_code < 0:
            logger.error(
                f"Child ({command_desc}) was terminated by signal {-return_code}"
            )
        if return_code > 0:
            logger.error(f"Command ({command_desc}) returned {return_code} status code")
        return return_code
    except OSError as e:
        logger.error(f"Execution ({command_desc}) failed due to {e}")
        raise e


def _pip_install(installer: str, command: str, command_desc: str) -> None:
    cmd = f"{installer} -m pip install {command}"
    try:
        return_code = _subprocess_call(command=cmd, command_desc=command_desc)
        if return_code != 0:
            raise CouldNotInstallRequirements
    except OSError as e:
        raise CouldNotInstallRequirements from e


def _pip_is_lib_installed(
    installer: str, target: str, libname: str, version: Optional[str] = None
) -> bool:
    lib_installed_cmd = f"{installer} -m pip show --version {libname}"
    lib_version_match_cmd = f'{lib_installed_cmd} | grep "Version: {version}"'

    cmd = lib_version_match_cmd if version else lib_installed_cmd

    try:
        my_env = os.environ.copy()
        my_env["PYTHONPATH"] = target
        return_code = _subprocess_call(command=cmd, env=my_env)
        return return_code == 0
    except OSError as e:
        raise CouldNotInstallRequirements from e


def _check_ucc_library_in_requirements_file(path_to_requirements: str) -> bool:
    with open(path_to_requirements) as f_reqs:
        content = f_reqs.readlines()
    for line in content:
        if "splunktaucclib" in line:
            return True
    return False


def install_python_libraries(
    source_path: str,
    ucc_lib_target: str,
    python_binary_name: str,
    includes_ui: bool = False,
    os_libraries: Optional[List[OSDependentLibraryConfig]] = None,
    pip_version: str = "latest",
    pip_legacy_resolver: bool = False,
) -> None:
    path_to_requirements_file = os.path.join(source_path, "lib", "requirements.txt")
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
        )
        if includes_ui and not _pip_is_lib_installed(
            installer=python_binary_name,
            target=ucc_lib_target,
            libname="splunktaucclib",
        ):
            raise SplunktaucclibNotFound(
                f"splunktaucclib is not found in {path_to_requirements_file}. "
                f"Please add it there because this add-on has UI."
            )

        cleanup_libraries = install_os_dependent_libraries(
            ucc_lib_target=ucc_lib_target,
            installer=python_binary_name,
            os_libraries=os_libraries,
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
            "Please remove '--pip-legacy-resolver' from your build command or use a different version of pip."
        )
        sys.exit(1)

    deps_resolver = "--use-deprecated=legacy-resolver " if pip_legacy_resolver else ""
    pip_install_command = (
        f'-r "{requirements_file_path}" '
        f"--no-compile "
        f"--prefer-binary "
        f"--ignore-installed "
        f"{deps_resolver}"
        f'--target "{installation_path}"'
    )
    _pip_install(
        installer=installer, command=pip_update_command, command_desc="pip upgrade"
    )

    _pip_install(
        installer=installer, command=pip_install_command, command_desc="pip install"
    )


def remove_packages(installation_path: str, package_names: Iterable[str]) -> None:
    p = Path(installation_path)
    for package_name in package_names:
        for o in p.glob(f"{package_name}*"):
            if o.is_dir():
                logger.info(f"  removing directory {o} from {installation_path}")
                shutil.rmtree(o)


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
) -> Set[str]:
    cleanup_libraries: Set[str] = set()

    if not os_libraries:
        logger.info("No os-dependentLibraries to install.")
        return cleanup_libraries

    logger.info("Installing os-dependentLibraries.")
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
            f"{os_lib.name}=={os_lib.version}"
        )

        try:
            _pip_install(
                installer=installer,
                command=pip_download_command,
                command_desc="pip download",
            )
        except CouldNotInstallRequirements:
            logger.error(
                "Downloading process failed. Please verify parameters in the globalConfig.json file."
            )
            sys.exit("Package building process interrupted.")
        cleanup_libraries.add(os_lib.name)
    return cleanup_libraries
