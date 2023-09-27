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
import functools
import json
from typing import Optional, Any, List, Dict

import yaml

from splunk_add_on_ucc_framework import utils

Loader = getattr(yaml, "CSafeLoader", yaml.SafeLoader)
yaml_load = functools.partial(yaml.load, Loader=Loader)


class GlobalConfig:
    def __init__(self, global_config_path: str, is_global_config_yaml: bool) -> None:
        with open(global_config_path) as f_config:
            config_raw = f_config.read()
        self._content = (
            yaml_load(config_raw) if is_global_config_yaml else json.loads(config_raw)
        )
        self._is_global_config_yaml = is_global_config_yaml
        self._original_path = global_config_path

    def dump(self, path: str) -> None:
        if self._is_global_config_yaml:
            utils.dump_yaml_config(self._content, path)
        else:
            utils.dump_json_config(self._content, path)

    @property
    def content(self) -> Any:
        return self._content

    @property
    def inputs(self) -> List[Any]:
        if "inputs" in self._content["pages"]:
            return self._content["pages"]["inputs"]["services"]
        return []

    @property
    def tabs(self) -> List[Any]:
        return self._content["pages"]["configuration"]["tabs"]

    @property
    def dashboard(self) -> Dict[str, Any]:
        return self._content["pages"].get("dashboard")

    @property
    def settings(self) -> List[Any]:
        settings = []
        for tab in self.tabs:
            if "table" not in tab:
                settings.append(tab)
        return settings

    @property
    def configs(self) -> List[Any]:
        configs = []
        for tab in self.tabs:
            if "table" in tab:
                configs.append(tab)
        return configs

    @property
    def alerts(self) -> List[Dict[str, Any]]:
        return self._content.get("alerts", [])

    @property
    def meta(self) -> Dict[str, str]:
        return self._content["meta"]

    @property
    def namespace(self) -> str:
        return self.meta["restRoot"]

    @property
    def product(self) -> str:
        return self.meta["name"]

    @property
    def display_name(self) -> str:
        return self.meta["displayName"]

    @property
    def version(self) -> str:
        return self.meta["version"]

    @property
    def original_path(self) -> str:
        return self._original_path

    @property
    def schema_version(self) -> Optional[str]:
        return self.meta.get("schemaVersion")

    def update_schema_version(self, new_schema_version: str) -> None:
        self.meta["schemaVersion"] = new_schema_version

    def update_addon_version(self, version: str) -> None:
        self._content.setdefault("meta", {})["version"] = version

    def has_inputs(self) -> bool:
        return bool(self.inputs)

    def has_alerts(self) -> bool:
        return bool(self.alerts)

    def has_dashboard(self) -> bool:
        return self.dashboard is not None

    def has_oauth(self) -> bool:
        for tab in self.tabs:
            if tab["name"] == "account":
                for entity in tab["entity"]:
                    if entity["type"] == "oauth":
                        return True
        return False
