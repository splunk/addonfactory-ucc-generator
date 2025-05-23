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
import logging
import os
import re
from collections import namedtuple
from pathlib import Path
from typing import Optional

logger = logging.getLogger("ucc_gen")
FileUpdater = namedtuple("FileUpdater", ["path_segments", "function"])


_base_html_pattern = re.compile(
    r"<script\s+src=\"\${make_url\(page_path\)}\"\s*>\s*</script>"
)


def _handle_base_html_update(content: str) -> Optional[str]:
    matches = _base_html_pattern.findall(content)

    if not matches:
        return None

    for result in matches:
        content = content.replace(
            result, '<script type="module" src="${make_url(page_path)}"></script>'
        )

    return content


def handle_package_files_update(path: str) -> None:
    files_to_update = [
        FileUpdater(("appserver", "templates", "base.html"), _handle_base_html_update)
    ]

    for file_updater in files_to_update:
        relative_path = os.path.join(*file_updater.path_segments)
        file_path = os.path.join(path, *file_updater.path_segments)

        if not os.path.isfile(file_path):
            continue

        path_obj = Path(file_path)
        original_content = path_obj.read_text()
        output_content = file_updater.function(original_content)

        if output_content is None or original_content == output_content:
            continue

        path_obj.write_text(output_content)
        logger.info(
            f"File '{relative_path}' exists in the package directory and its content needed to be updated by UCC."
        )
