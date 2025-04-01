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
import os
import subprocess

import logging
import sys
import json

from typing import Dict, Any, FrozenSet
from splunk_add_on_ucc_framework import app_manifest as ap

logger = logging.getLogger("ucc_gen")


def import_from_aob(addon_name: str) -> None:
    addon_name_directory = os.path.join(os.getcwd(), addon_name)
    if not os.path.isdir(addon_name_directory):
        logger.error(f"No such directory {addon_name_directory}")
        sys.exit(1)
    import_from_aob_script_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "commands",
        "import_from_aob.sh",
    )
    imports_py_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "commands", "imports.py"
    )
    subprocess.call((import_from_aob_script_path, addon_name, imports_py_path))
    addon_ucc_path = addon_name_directory + "_ucc"
    a_path = os.path.join(*[os.getcwd(), addon_ucc_path, "package", "app.manifest"])
    with open(a_path, encoding="utf-8") as f:
        data = json.load(f)

    add_app_manifest_key(
        data, "supportedDeployments", ap.APP_MANIFEST_SUPPORTED_DEPLOYMENTS
    )
    add_app_manifest_key(data, "targetWorkloads", ap.APP_MANIFEST_TARGET_WORKLOADS)
    check_app_manifest_schema_version(data)

    with open(a_path, "w", encoding="utf-8") as f:
        json.dump(data, f, default=list, ensure_ascii=False, indent=4)


def add_app_manifest_key(
    app_manifest_data: Dict[Any, Any], key: str, value: FrozenSet[str]
) -> None:
    if key not in app_manifest_data:
        app_manifest_data.update({key: value})
    elif app_manifest_data[key] is None:
        app_manifest_data.pop(key)
        app_manifest_data.update({key: value})


def check_app_manifest_schema_version(app_manifest_data: Dict[Any, Any]) -> None:
    key = "schemaVersion"
    version = app_manifest_data[key]
    if version != ap.APP_MANIFEST_SCHEMA_VERSION:
        app_manifest_data.pop(key)
        app_manifest_data.update({key: ap.APP_MANIFEST_SCHEMA_VERSION})
