#
# Copyright 2021 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
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
from pathlib import Path
from typing import Sequence

logger = logging.getLogger("ucc_gen")


def install_python_libraries(path: str, ucc_lib_target: str, python_binary_name: str):
    logger.info(f"  Checking for requirements in {path}")
    if os.path.exists(os.path.join(path, "lib", "requirements.txt")):
        logger.info("  Uses common requirements")
        install_libraries(
            os.path.join(path, "lib", "requirements.txt"),
            ucc_lib_target,
            python_binary_name,
        )
    elif os.path.exists(
        os.path.join(os.path.abspath(os.path.join(path, os.pardir)), "requirements.txt")
    ):
        logger.info("  Uses common requirements")
        install_libraries(
            os.path.join(
                os.path.abspath(os.path.join(path, os.pardir)), "requirements.txt"
            ),
            ucc_lib_target,
            python_binary_name,
        )
    else:
        logger.info("  Not using common requirements")

    packages_to_remove = ["setuptools", "bin", "pip", "distribute", "wheel"]
    remove_package_from_installed_path(
        ucc_lib_target,
        packages_to_remove,
    )

    remove_execute_bit(ucc_lib_target)


def install_libraries(
    requirements_file_path: str,
    installation_path: str,
    installer: str,
):
    if not os.path.exists(requirements_file_path):
        logger.warning(f"Unable to find requirements file: {requirements_file_path}")
    else:
        if not os.path.exists(installation_path):
            os.makedirs(installation_path)
        install_cmd = (
            installer
            + ' -m pip install -r "'
            + requirements_file_path
            + '" --no-compile --prefer-binary --ignore-installed --use-deprecated=legacy-resolver --target "'
            + installation_path
            + '"'
        )
        os.system(installer + " -m pip install pip --upgrade")
        os.system(install_cmd)


def remove_package_from_installed_path(
    installation_path: str, package_names: Sequence[str]
):
    p = Path(installation_path)
    try:
        for package_name in package_names:
            for o in p.glob(f"{package_name}*"):
                if o.is_dir():
                    logger.info(f"  removing directory {o} from {installation_path}")
                    shutil.rmtree(o)
    except FileNotFoundError:
        pass


def remove_execute_bit(installation_path: str):
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
