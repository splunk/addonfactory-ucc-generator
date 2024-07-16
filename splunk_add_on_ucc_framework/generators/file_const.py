from collections import namedtuple

from splunk_add_on_ucc_framework.generators.conf_files import (
    AppConf,
    ServerConf,
    RestMapConf,
    WebConf,
)

__all__ = ["FileClass", "FILE_TUPLE"]
FileClass = namedtuple(
    "FileClass",
    field_names=["file_name", "file_class", "file_path", "file_description"],
)
# TODO: add more description to the files
FILE_TUPLE = (
    # FileClass("app.conf", AppConf, "default", AppConf.__description__),
    FileClass("server.conf", ServerConf, "default", ServerConf.__description__),
    FileClass("restmap.conf", RestMapConf, "default", RestMapConf.__description__),
    FileClass("web.conf", WebConf, "default", WebConf.__description__),
)
