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
from typing import List, NamedTuple, Type, Union

from splunk_add_on_ucc_framework.generators.html_files import AlertActionsHtml

__all__ = ["FileClass", "GEN_FILE_LIST"]


class FileClass(NamedTuple):
    file_name: str
    file_class: Type[Union[AlertActionsHtml]]
    file_path: Union[str, List[str]]
    file_description: str


GEN_FILE_LIST: List[FileClass] = [
    FileClass(
        "_.html",
        AlertActionsHtml,
        ["default", "data", "ui", "alerts"],
        AlertActionsHtml.__description__,
    ),
]
