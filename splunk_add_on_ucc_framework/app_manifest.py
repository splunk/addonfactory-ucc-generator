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

import json
from typing import Dict, List, Optional, Any

APP_MANIFEST_SCHEMA_VERSION = "2.0.0"
APP_MANIFEST_SUPPORTED_DEPLOYMENTS = frozenset(
    [
        "*",
        "_standalone",
        "_distributed",
        "_search_head_clustering",
    ]
)
APP_MANIFEST_TARGET_WORKLOADS = frozenset(
    [
        "*",
        "_search_heads",
        "_indexers",
        "_forwarders",
    ]
)
APP_MANIFEST_FILE_NAME = "app.manifest"
APP_MANIFEST_WEBSITE = "https://dev.splunk.com/enterprise/reference/packagingtoolkit/pkgtoolkitappmanifest/"


class AppManifestFormatException(Exception):
    pass


class AppManifest:
    def __init__(self, content: str) -> None:
        try:
            self._manifest = json.loads(content)
        except json.JSONDecodeError:
            raise AppManifestFormatException(
                "Could not parse app.manifest, not a correct JSON file"
            )

    def get_addon_name(self) -> str:
        return self._manifest["info"]["id"]["name"]

    def get_addon_version(self) -> str:
        return self._manifest["info"]["id"]["version"]

    def get_title(self) -> str:
        return self._manifest["info"]["title"]

    def get_description(self) -> str:
        return self._manifest["info"]["description"]

    def get_license_name(self) -> str:
        return self._manifest["info"]["license"]["name"]

    def get_license_uri(self) -> str:
        return self._manifest["info"]["license"]["uri"]

    def get_authors(self) -> List[Dict[str, str]]:
        return self._manifest["info"]["author"]

    def _get_schema_version(self) -> Optional[str]:
        return self._manifest.get("schemaVersion")

    def _get_supported_deployments(self) -> Optional[List[str]]:
        return self._manifest.get("supportedDeployments")

    def _get_target_workloads(self) -> Optional[List[str]]:
        return self._manifest.get("targetWorkloads")

    @property
    def manifest(self) -> Dict[str, Any]:
        return self._manifest

    def update_addon_version(self, version: str) -> None:
        self._manifest["info"]["id"]["version"] = version

    def validate(self) -> None:
        schema_version = self._get_schema_version()
        if schema_version != APP_MANIFEST_SCHEMA_VERSION:
            raise AppManifestFormatException(
                f"schemaVersion should be '{APP_MANIFEST_SCHEMA_VERSION}'"
            )
        supported_deployments = self._get_supported_deployments()
        if not supported_deployments:
            raise AppManifestFormatException("supportedDeployments should be set")
        supported_deployments_set = set(supported_deployments)
        if not supported_deployments_set.issubset(APP_MANIFEST_SUPPORTED_DEPLOYMENTS):
            raise AppManifestFormatException(
                f"supportedDeployments should only have values from '{APP_MANIFEST_SUPPORTED_DEPLOYMENTS}'"
            )
        target_workloads = self._get_target_workloads()
        if not target_workloads:
            raise AppManifestFormatException("targetWorkloads should be set")
        target_workloads_set = set(target_workloads)
        if not target_workloads_set.issubset(APP_MANIFEST_TARGET_WORKLOADS):
            raise AppManifestFormatException(
                f"targetWorkloads should only have values from '{APP_MANIFEST_TARGET_WORKLOADS}'"
            )

    def __str__(self) -> str:
        return json.dumps(self._manifest, indent=4, sort_keys=True)
