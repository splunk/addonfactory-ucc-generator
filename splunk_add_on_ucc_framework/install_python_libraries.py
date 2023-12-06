#
# Copyright 2023 Splunk Inc.
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
from typing import Sequence, Any, List, Dict, Optional

logger = logging.getLogger("ucc_gen")


class SplunktaucclibNotFound(Exception):
    pass


class CouldNotInstallRequirements(Exception):
    pass


def _subprocess_call(command: str, command_desc: str) -> None:
    try:
        return_code = subprocess.call(command, shell=True)
        if return_code < 0:
            logger.error(
                f"Child ({command_desc}) was terminated by signal {-return_code}"
            )
            raise CouldNotInstallRequirements
        if return_code > 0:
            logger.error(f"Command ({command_desc}) returned {return_code} status code")
            raise CouldNotInstallRequirements
    except OSError as e:
        logger.error(f"Execution ({command_desc}) failed due to {e}")
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
    os_libraries: Optional[List[Dict[str, Any]]] = None,
) -> None:
    path_to_requirements_file = os.path.join(source_path, "lib", "requirements.txt")
    if os.path.isfile(path_to_requirements_file):
        logger.info(f"Installing requirements from {path_to_requirements_file}")
        if includes_ui:
            ucc_library_present = _check_ucc_library_in_requirements_file(
                path_to_requirements_file
            )
            if not ucc_library_present:
                raise SplunktaucclibNotFound(
                    f"splunktaucclib is not found in {path_to_requirements_file}. "
                    f"Please add it there because this add-on has UI."
                )
        if not os.path.exists(ucc_lib_target):
            os.makedirs(ucc_lib_target)
        install_libraries(
            path_to_requirements_file,
            ucc_lib_target,
            python_binary_name,
        )

        if os_libraries:
            install_os_dependent_libraries(
                ucc_lib_target, python_binary_name, os_libraries
            )

        packages_to_remove = (
            "setuptools",
            "bin",
            "pip",
            "distribute",
            "wheel",
        )
        remove_package_from_installed_path(
            ucc_lib_target,
            packages_to_remove,
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
) -> None:
    """
    Upgrades `pip` version to the latest one and installs requirements to the
    specified path.
    """

    pip_version = "23.1.2"
    pip_update_command = f"{installer} -m pip install --upgrade pip=={pip_version}"
    pip_install_command = (
        f"{installer} "
        f"-m pip "
        f"install "
        f'-r "{requirements_file_path}" '
        f"--no-compile "
        f"--prefer-binary "
        f"--ignore-installed "
        f"--use-deprecated=legacy-resolver "
        f'--target "{installation_path}"'
    )

    _subprocess_call(pip_update_command, "pip upgrade")
    _subprocess_call(pip_install_command, "pip install")


def remove_package_from_installed_path(
    installation_path: str, package_names: Sequence[str]
) -> None:
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
    ucc_lib_target: str, installer: str, os_libraries: List[Dict[str, Any]]
) -> None:
    for package in os_libraries:
        params = get_download_params(package)
        target_path = os.path.join(
            ucc_lib_target, os.path.normpath(params.get("target", ""))
        )

        if not os.path.exists(target_path):
            os.makedirs(target_path)

        pip_download_command = (
            f"{installer} "
            f"-m pip "
            f"install "
            f"{params.get('dependencies')} "
            f"--platform {params.get('platform')} "
            f"--python-version {params.get('python_version')} "
            f"--target {target_path}"
            f" --only-binary=:all: "
            f"{params.get('name')}=={params.get('version')}"
        )

        logger.info(f"Executing: {pip_download_command}")
        try:
            _subprocess_call(pip_download_command, "pip download")
        except CouldNotInstallRequirements:
            logger.error(
                "Downloading process failed. Please verify parameters in the globalConfig.json file."
            )
            sys.exit("Package building process interrupted.")


def get_download_params(package: Dict[str, str]) -> Dict[str, str]:
    params = {
        "name": package.get("name", ""),
        "version": package.get("version", ""),
        "dependencies": "" if package.get("dependencies", "") else "--no-deps",
        "platform": package.get("platform", ""),
        "python_version": package.get("python-version", ""),
        "target": package.get("target", ""),
    }

    return params
