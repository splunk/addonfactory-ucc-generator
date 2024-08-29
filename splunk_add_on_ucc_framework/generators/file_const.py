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
from .file_generator import FileGenerator

from splunk_add_on_ucc_framework.generators.xml_files import (
    ConfigurationXml,
    DashboardXml,
    DefaultXml,
    InputsXml,
    RedirectXml,
)
from splunk_add_on_ucc_framework.generators.html_files import AlertActionsHtml
from splunk_add_on_ucc_framework.generators.conf_files import (
    AlertActionsConf,
    AppConf,
    EventtypesConf,
    InputsConf,
    RestMapConf,
    ServerConf,
    TagsConf,
    WebConf,
    AccountConf,
    SettingsConf,
)

__all__ = ["FileClass", "GEN_FILE_LIST"]


class FileClass(NamedTuple):
    file_name: str
    file_class: Type[FileGenerator]
    file_path: Union[str, List[str]]
    file_description: str


GEN_FILE_LIST: List[FileClass] = [
    FileClass("app.conf", AppConf, "default", AppConf.__description__),
    FileClass("inputs.conf", InputsConf, "default", InputsConf.__description__),
    FileClass("server.conf", ServerConf, "default", ServerConf.__description__),
    FileClass("restmap.conf", RestMapConf, "default", RestMapConf.__description__),
    FileClass("web.conf", WebConf, "default", WebConf.__description__),
    FileClass(
        "alert_actions.conf",
        AlertActionsConf,
        "default",
        AlertActionsConf.__description__,
    ),
    FileClass(
        "eventtypes.conf", EventtypesConf, "default", EventtypesConf.__description__
    ),
    FileClass("tags.conf", TagsConf, "default", TagsConf.__description__),
    FileClass("_account.conf", AccountConf, "README", AccountConf.__description__),
    FileClass("_settings.conf", SettingsConf, "README", SettingsConf.__description__),
    FileClass(
        "configuration.xml",
        ConfigurationXml,
        ["default", "data", "ui", "views"],
        ConfigurationXml.__description__,
    ),
    FileClass(
        "dashboard.xml",
        DashboardXml,
        ["default", "data", "ui", "views"],
        DashboardXml.__description__,
    ),
    FileClass(
        "default.xml",
        DefaultXml,
        ["default", "data", "ui", "nav"],
        DefaultXml.__description__,
    ),
    FileClass(
        "inputs.xml",
        InputsXml,
        ["default", "data", "ui", "views"],
        InputsXml.__description__,
    ),
    FileClass(
        "_redirect.xml",
        RedirectXml,
        ["default", "data", "ui", "views"],
        RedirectXml.__description__,
    ),
    FileClass(
        "_.html",
        AlertActionsHtml,
        ["default", "data", "ui", "alerts"],
        AlertActionsHtml.__description__,
    ),
]
