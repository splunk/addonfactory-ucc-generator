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
import functools
import json

import yaml

from splunk_add_on_ucc_framework import utils

Loader = getattr(yaml, "CSafeLoader", yaml.SafeLoader)
yaml_load = functools.partial(yaml.load, Loader=Loader)


class GlobalConfig:
    def __init__(self):
        self._content = None
        self._inputs = []
        self._tabs = []
        self._configs = []
        self._settings = []
        self._is_global_config_yaml = None
        self._original_path = None

    def parse(self, global_config_path: str, is_global_config_yaml: bool) -> None:
        with open(global_config_path) as f_config:
            config_raw = f_config.read()
        self._content = (
            yaml_load(config_raw) if is_global_config_yaml else json.loads(config_raw)
        )
        self._is_global_config_yaml = is_global_config_yaml
        self._original_path = global_config_path

    def dump(self, path: str):
        if self._is_global_config_yaml:
            utils.dump_yaml_config(self._content, path)
        else:
            utils.dump_json_config(self._content, path)

    def _parse_components(self):
        pages = self._content["pages"]
        configuration = pages.get("configuration", {})
        self._tabs = configuration.get("tabs", [])
        # TODO: do we need this?
        for tab in self._tabs:
            if "table" in tab:
                self._configs.append(tab)
            else:
                self._settings.append(tab)
        if "inputs" in pages:
            self._inputs = pages["inputs"]["services"]

    @property
    def is_global_config_yaml(self) -> bool:
        return self._is_global_config_yaml

    @property
    def content(self):
        return self._content

    @content.setter
    def content(self, new_content):
        self._content = new_content

    @property
    def inputs(self):
        return self._inputs

    @property
    def tabs(self):
        return self._tabs

    @property
    def configs(self):
        return self._configs

    @property
    def settings(self):
        return self._settings

    @property
    def meta(self):
        return self._content["meta"]

    @property
    def namespace(self) -> str:
        return self.meta["restRoot"]

    @property
    def product(self) -> str:
        return self.meta["name"]

    @property
    def version(self) -> str:
        return self.meta["version"]

    @property
    def original_path(self) -> str:
        return self._original_path

    def update_addon_version(self, version: str) -> None:
        self._content.setdefault("meta", {})["version"] = version