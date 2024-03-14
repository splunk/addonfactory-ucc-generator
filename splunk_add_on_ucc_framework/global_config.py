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
import copy
import functools
import json
from typing import Optional, Any, List, Dict
from dataclasses import dataclass, field, fields

import yaml

from splunk_add_on_ucc_framework import utils
from splunk_add_on_ucc_framework.tabs import resolve_tab

Loader = getattr(yaml, "CSafeLoader", yaml.SafeLoader)
yaml_load = functools.partial(yaml.load, Loader=Loader)


@dataclass(frozen=True)
class OSDependentLibraryConfig:
    name: str
    version: str
    platform: str
    python_version: str
    target: str
    os: str
    deps_flag: str
    dependencies: bool = field(default=False)

    @classmethod
    def from_dict(cls, **kwargs: Any) -> "OSDependentLibraryConfig":
        result = {
            dc_field.name: kwargs[dc_field.name]
            for dc_field in fields(cls)
            if dc_field.name in kwargs
            and (
                isinstance(kwargs[dc_field.name], dc_field.type)
                or kwargs[dc_field.name] is None
            )
        }
        deps_flag = "" if result.get("dependencies") else "--no-deps"
        result.update({"deps_flag": deps_flag})
        return cls(**result)


class GlobalConfig:
    def __init__(self, global_config_path: str, is_global_config_yaml: bool) -> None:
        with open(global_config_path) as f_config:
            config_raw = f_config.read()
        self._content = (
            yaml_load(config_raw) if is_global_config_yaml else json.loads(config_raw)
        )
        self._resolve_tabs()
        self._is_global_config_yaml = is_global_config_yaml
        self._original_path = global_config_path

    def dump(self, path: str, rendered: bool = False) -> None:
        content = self.content_rendered if rendered else self._content

        if self._is_global_config_yaml:
            utils.dump_yaml_config(content, path)
        else:
            utils.dump_json_config(content, path)

    def _resolve_tabs(self) -> None:
        for i, tab in enumerate(self._content["pages"]["configuration"]["tabs"]):
            self._content["pages"]["configuration"]["tabs"][i] = resolve_tab(tab)

    @property
    def content(self) -> Any:
        return self._content

    @property
    def content_rendered(self) -> Any:
        content = copy.deepcopy(self._content)

        for i, tab in enumerate(content["pages"]["configuration"]["tabs"]):
            content["pages"]["configuration"]["tabs"][i] = tab.render()

        return content

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
                settings.append(tab.render())
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
    def ucc_version(self) -> str:
        return self.meta["_uccVersion"]

    @property
    def original_path(self) -> str:
        return self._original_path

    @property
    def schema_version(self) -> Optional[str]:
        return self.meta.get("schemaVersion")

    @property
    def os_libraries(self) -> Optional[List[OSDependentLibraryConfig]]:
        if self._content["meta"].get("os-dependentLibraries"):
            return [
                OSDependentLibraryConfig.from_dict(**lib)
                for lib in self._content["meta"].get("os-dependentLibraries")
            ]
        return None

    def update_schema_version(self, new_schema_version: str) -> None:
        self.meta["schemaVersion"] = new_schema_version

    def update_addon_version(self, version: str) -> None:
        self._content.setdefault("meta", {})["version"] = version

    def add_ucc_version(self, version: str) -> None:
        self.content.setdefault("meta", {})["_uccVersion"] = version

    def has_inputs(self) -> bool:
        return bool(self.inputs)

    def has_alerts(self) -> bool:
        return bool(self.alerts)

    def has_dashboard(self) -> bool:
        return self.dashboard is not None

    def has_oauth(self) -> bool:
        for tab in self.tabs:
            if tab.name == "account":
                for entity in tab.entity:
                    if entity["type"] == "oauth":
                        return True
        return False
