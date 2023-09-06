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
import addonfactory_splunk_conf_parser_lib as conf_parser

DEFAULT = """
# Application-level permissions

[]
owner = admin
access = read : [ * ], write : [ admin, sc_admin ]
export = system
"""
DEFAULT_META_FILE_NAME = "default.meta"


class MetaConf:
    def __init__(self):
        self._meta_conf = conf_parser.TABConfigParser()

    def create_default(self) -> None:
        self._meta_conf.read_string(DEFAULT)

    def write(self, path: str) -> None:
        with open(path, "w") as fd:
            self._meta_conf.write(fd)
