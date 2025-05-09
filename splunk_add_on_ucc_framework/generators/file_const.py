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
from typing import List, NamedTuple, Type
from .file_generator import FileGenerator

from splunk_add_on_ucc_framework.generators.xml_files import (
    ConfigurationXml,
    DashboardXml,
    DefaultXml,
    InputsXml,
    RedirectXml,
)
from splunk_add_on_ucc_framework.generators.html_files import AlertActionsHtml
from splunk_add_on_ucc_framework.generators.python_files import CustomCommandPy
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
    CommandsConf,
    SearchbnfConf,
)

__all__ = ["FileClass", "GEN_FILE_LIST"]


class FileClass(NamedTuple):
    file_name: str
    file_class: Type[FileGenerator]
    file_path: List[str]


GEN_FILE_LIST: List[FileClass] = [
    FileClass("app.conf", AppConf, ["default"]),
    FileClass("inputs.conf", InputsConf, ["default"]),
    FileClass("server.conf", ServerConf, ["default"]),
    FileClass("restmap.conf", RestMapConf, ["default"]),
    FileClass("web.conf", WebConf, ["default"]),
    FileClass(
        "alert_actions.conf",
        AlertActionsConf,
        ["default"],
    ),
    FileClass("eventtypes.conf", EventtypesConf, ["default"]),
    FileClass("tags.conf", TagsConf, ["default"]),
    FileClass("commands.conf", CommandsConf, ["default"]),
    FileClass("searchbnf.conf", SearchbnfConf, ["default"]),
    FileClass("_account.conf", AccountConf, ["README"]),
    FileClass("_settings.conf", SettingsConf, ["README"]),
    FileClass(
        "configuration.xml",
        ConfigurationXml,
        ["default", "data", "ui", "views"],
    ),
    FileClass(
        "dashboard.xml",
        DashboardXml,
        ["default", "data", "ui", "views"],
    ),
    FileClass(
        "default.xml",
        DefaultXml,
        ["default", "data", "ui", "nav"],
    ),
    FileClass(
        "inputs.xml",
        InputsXml,
        ["default", "data", "ui", "views"],
    ),
    FileClass(
        "_redirect.xml",
        RedirectXml,
        ["default", "data", "ui", "views"],
    ),
    FileClass(
        "_.html",
        AlertActionsHtml,
        ["default", "data", "ui", "alerts"],
    ),
    FileClass(
        "_.py",
        CustomCommandPy,
        ["bin"],
    ),
]
