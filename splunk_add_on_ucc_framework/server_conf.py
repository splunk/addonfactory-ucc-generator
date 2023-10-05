#
# Copyright 2023 Splunk Inc.
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
from typing import Sequence

import addonfactory_splunk_conf_parser_lib as conf_parser

SERVER_CONF_FILE_NAME = "server.conf"


class ServerConf:
    def __init__(self) -> None:
        self._server_conf = conf_parser.TABConfigParser()

    def create_default(self, conf_file_names: Sequence[str]) -> None:
        self._server_conf.add_section("shclustering")
        for conf_file_name in conf_file_names:
            self._server_conf["shclustering"][
                f"conf_replication_include.{conf_file_name}"
            ] = "true"

    def write(self, path: str) -> None:
        with open(path, "w") as fd:
            self._server_conf.write(fd)
