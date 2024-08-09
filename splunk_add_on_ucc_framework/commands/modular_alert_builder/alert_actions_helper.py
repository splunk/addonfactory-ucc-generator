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
import logging
from os import makedirs, remove, path

import addonfactory_splunk_conf_parser_lib as conf_parser

from splunk_add_on_ucc_framework.commands.modular_alert_builder.alert_actions_merge import (
    merge_conf_file,
)

logger = logging.getLogger("ucc_gen")


def write_file(file_name: str, file_path: str, content: str, **kwargs: str) -> None:
    """
    :param merge_mode: only supported for .conf and .conf.spec files.
    """
    logger.debug('operation="write", object="%s" object_type="file"', file_path)

    merge_mode = kwargs.get("merge_mode", "stanza_overwrite")
    do_merge = False
    if file_name.endswith(".conf") or file_name.endswith(".conf.spec"):
        do_merge = True
    else:
        logger.debug(
            f"'{file_name}' is not going to be merged, only .conf and "
            f".conf.spec files are supported."
        )

    new_file = None
    if path.exists(file_path) and do_merge:
        new_file = path.join(path.dirname(file_path), "new_" + file_name)
    if new_file:
        try:
            with open(new_file, "w+") as fhandler:
                fhandler.write(content)
            merge_conf_file(new_file, file_path, merge_mode=merge_mode)
        finally:
            if path.exists(new_file):
                remove(new_file)
    else:
        if not path.exists(path.dirname(file_path)):
            makedirs(path.dirname(file_path))
        with open(file_path, "w+") as fhandler:
            fhandler.write(content)
        if do_merge:
            parser = conf_parser.TABConfigParser()
            parser.read(file_path)
            with open(file_path, "w") as df:
                parser.write(df)
