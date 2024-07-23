from typing import List, NamedTuple, Type, Union

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
    file_class: Type[
        Union[
            AppConf,
            ServerConf,
            RestMapConf,
            WebConf,
            AlertActionsConf,
            EventtypesConf,
            TagsConf,
            InputsConf,
            AccountConf,
            SettingsConf,
        ]
    ]
    file_path: str
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
]
