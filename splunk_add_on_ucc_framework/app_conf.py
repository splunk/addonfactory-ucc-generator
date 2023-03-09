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
import time
from typing import Sequence

import addonfactory_splunk_conf_parser_lib as conf_parser
from splunk_add_on_ucc_framework import app_manifest as app_manifest_lib

APP_CONF_FILE_NAME = "app.conf"


class AppConf:
    def __init__(self):
        self._app_conf = conf_parser.TABConfigParser()

    def read(self, path: str) -> None:
        self._app_conf.read(path)

    def update(
        self,
        version: str,
        app_manifest: app_manifest_lib.AppManifest,
        conf_file_names: Sequence[str],
    ) -> None:
        if "launcher" not in self._app_conf:
            self._app_conf.add_section("launcher")
        if "id" not in self._app_conf:
            self._app_conf.add_section("id")
        if "install" not in self._app_conf:
            self._app_conf.add_section("install")
        if "package" not in self._app_conf:
            self._app_conf.add_section("package")
        if "ui" not in self._app_conf:
            self._app_conf.add_section("ui")
        if "triggers" not in self._app_conf and conf_file_names:
            self._app_conf.add_section("triggers")

        self._app_conf["launcher"]["version"] = version
        self._app_conf["launcher"]["description"] = app_manifest.get_description()
        authors = app_manifest.get_authors()
        first_author = authors[0]
        self._app_conf["launcher"]["author"] = first_author["name"]
        self._app_conf["id"]["version"] = version
        self._app_conf["id"]["name"] = app_manifest.get_addon_name()
        self._app_conf["install"]["build"] = str(int(time.time()))
        self._app_conf["install"]["is_configured"] = "true"
        self._app_conf["install"]["state"] = "enabled"
        self._app_conf["package"]["id"] = app_manifest.get_addon_name()
        self._app_conf["ui"]["label"] = app_manifest.get_title()
        self._app_conf["ui"]["is_visible"] = "true"
        for conf_file_name in conf_file_names:
            self._app_conf["triggers"][f"reload.{conf_file_name}"] = "simple"

    def write(self, path: str) -> None:
        with open(path, "w") as fd:
            self._app_conf.write(fd)
