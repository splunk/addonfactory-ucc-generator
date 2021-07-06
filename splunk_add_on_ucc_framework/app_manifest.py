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

import json
import warnings

APP_MANIFEST_FILE_NAME = "app.manifest"
APP_MANIFEST_WEBSITE = "https://dev.splunk.com/enterprise/reference/packagingtoolkit/pkgtoolkitappmanifest/"

DEPRECATION_MESSAGE = f"""
Comments are not allowed in app.manifest file.
Please refer to {APP_MANIFEST_WEBSITE}
"""


class AppManifestFormatException(Exception):
    pass


class AppManifest:
    def __init__(self):
        self._manifest = None
        self._comments = []

    def get_addon_name(self) -> str:
        return self._manifest["info"]["id"]["name"]

    def get_title(self) -> str:
        return self._manifest["info"]["title"]

    def get_description(self) -> str:
        return self._manifest["info"]["description"]

    def read(self, content: str) -> None:
        try:
            self._manifest = json.loads(content)
        except json.JSONDecodeError:
            # Manifest file has comments.
            manifest_lines = []
            for line in content.split("\n"):
                if line.lstrip().startswith("#"):
                    self._comments.append(line)
                else:
                    manifest_lines.append(line)
            if self._comments:
                warnings.warn(DEPRECATION_MESSAGE, FutureWarning)
            manifest = "".join(manifest_lines)
            try:
                self._manifest = json.loads(manifest)
            except json.JSONDecodeError:
                raise AppManifestFormatException

    def update_addon_version(self, version: str) -> None:
        self._manifest["info"]["id"]["version"] = version

    def __str__(self) -> str:
        content = json.dumps(self._manifest, indent=4, sort_keys=True)
        if self._comments:
            for comment in self._comments:
                content += f"\n{comment}"
        return content
