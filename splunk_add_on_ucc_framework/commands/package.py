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
import tarfile
from typing import Optional

from splunk_add_on_ucc_framework import app_manifest as app_manifest_lib

logger = logging.getLogger("ucc_gen")


def _get_package_output_path(output_directory: Optional[str] = None) -> str:
    if output_directory is None:
        return os.path.join(os.getcwd())
    else:
        if not os.path.isabs(output_directory):
            return os.path.join(os.getcwd(), output_directory)
        return output_directory


def package(path_to_built_addon: str, output: Optional[str] = None) -> None:
    """
    Archives a built add-on to the current directory with a specific add-on name
    and version.
    """
    logger.info(f"Packaging app at {path_to_built_addon}")
    app_manifest = app_manifest_lib.AppManifest()
    app_manifest_path = os.path.join(
        path_to_built_addon, app_manifest_lib.APP_MANIFEST_FILE_NAME
    )
    if not os.path.exists(app_manifest_path):
        logger.error(
            f"No {app_manifest_lib.APP_MANIFEST_FILE_NAME} found @ {app_manifest_path}. "
            f"Cannot package an add-on without a manifest file. "
            f"Please check the --path provided."
        )
        exit(1)
    with open(app_manifest_path) as _f:
        app_manifest.read(_f.read())

    addon_name = app_manifest.get_addon_name()
    addon_version = app_manifest.get_addon_version()
    output_directory = _get_package_output_path(output)
    archive_path = os.path.join(
        output_directory, f"{addon_name}-{addon_version}.tar.gz"
    )
    with tarfile.open(archive_path, mode="w", encoding="utf-8") as archive_file:
        logger.info(path_to_built_addon)
        archive_file.add(path_to_built_addon, arcname=addon_name)
    logger.info(f"Package exported to {archive_path}")
