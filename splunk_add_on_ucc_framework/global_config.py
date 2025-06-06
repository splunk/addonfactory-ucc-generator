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
import functools
import json
from typing import Optional, Any, List, Dict
from dataclasses import dataclass, field, fields

import yaml

from splunk_add_on_ucc_framework import utils
from splunk_add_on_ucc_framework import app_manifest as app_manifest_lib
from splunk_add_on_ucc_framework.commands.rest_builder.user_defined_rest_handlers import (
    UserDefinedRestHandlers,
)
from splunk_add_on_ucc_framework.entity import expand_entity
from splunk_add_on_ucc_framework.tabs import resolve_tab, LoggingTab

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
        result.update({"python_version": result["python_version"]})
        return cls(**result)


class GlobalConfig:
    def __init__(
        self,
        content: Dict[str, Any],
        is_yaml: bool,
    ) -> None:
        self._content = content
        self._is_global_config_yaml = is_yaml
        self.user_defined_handlers = UserDefinedRestHandlers()

    @classmethod
    def from_file(cls, global_config_path: str) -> "GlobalConfig":
        with open(global_config_path) as f_config:
            config_raw = f_config.read()
        is_global_config_yaml = True if global_config_path.endswith(".yaml") else False
        content = (
            yaml_load(config_raw) if is_global_config_yaml else json.loads(config_raw)
        )
        return GlobalConfig(content, is_global_config_yaml)

    @classmethod
    def from_app_manifest(
        cls, app_manifest: app_manifest_lib.AppManifest
    ) -> "GlobalConfig":
        content = {
            "meta": {
                "name": app_manifest.get_addon_name(),
                # TODO(ADDON-79208): once `restRoot` is optional, this line can be removed
                "restRoot": app_manifest.get_addon_name(),
                "displayName": app_manifest.get_title(),
                "version": app_manifest.get_addon_version(),
            }
        }
        return GlobalConfig(
            content,
            False,
        )

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, GlobalConfig):
            raise NotImplementedError()
        return all(
            [
                self.content == other.content,
                self.is_yaml == other.is_yaml,
            ]
        )

    def parse_user_defined_handlers(self) -> None:
        """Parse user-defined REST handlers from globalConfig["options"]["restHandlers"]"""
        rest_handlers = self._content.get("options", {}).get("restHandlers", [])
        self.user_defined_handlers.add_definitions(rest_handlers)

    def dump(self, path: str) -> None:
        if self.is_yaml:
            utils.dump_yaml_config(self.content, path)
        else:
            utils.dump_json_config(self.content, path)

    def expand(self) -> None:
        self.expand_tabs()
        self.expand_entities()

    def expand_tabs(self) -> None:
        if self.has_pages() and self.has_configuration():
            for i, tab in enumerate(self._content["pages"]["configuration"]["tabs"]):
                self._content["pages"]["configuration"]["tabs"][i] = resolve_tab(tab)

    def expand_entities(self) -> None:
        self._expand_entities(
            self._content.get("pages", {}).get("configuration", {}).get("tabs")
        )
        self._expand_entities(
            self._content.get("pages", {}).get("inputs", {}).get("services")
        )

    @staticmethod
    def _expand_entities(items: Optional[List[Dict[Any, Any]]]) -> None:
        if items is None:
            return

        for item in items:
            for i, entity in enumerate(item.get("entity", [])):
                item["entity"][i] = expand_entity(entity)

    @property
    def content(self) -> Any:
        return self._content

    @property
    def is_yaml(self) -> bool:
        return self._is_global_config_yaml

    @property
    def inputs(self) -> List[Any]:
        if self.has_pages() and "inputs" in self._content["pages"]:
            return self._content["pages"]["inputs"]["services"]
        return []

    @property
    def configuration(self) -> List[Any]:
        if self.has_pages() and "configuration" in self._content["pages"]:
            return self._content["pages"]["configuration"]["tabs"]
        return []

    @property
    def pages(self) -> List[Any]:
        if "pages" in self._content:
            return self._content["pages"]
        return []

    @property
    def resolved_configuration(self) -> List[Any]:
        if self.has_pages() and "configuration" in self.pages:
            return [resolve_tab(tab) for tab in self.configuration]
        return []

    @property
    def dashboard(self) -> Dict[str, Any]:
        return self._content.get("pages", {}).get("dashboard")

    @property
    def settings(self) -> List[Any]:
        settings = []
        for tab in self.configuration:
            if "table" not in tab:
                settings.append(tab)
        return settings

    @property
    def logging_tab(self) -> Dict[str, Any]:
        for tab in self.configuration:
            if LoggingTab.from_definition(tab) is not None:
                return tab
        return {}

    @property
    def configs(self) -> List[Any]:
        configs = []
        for tab in self.configuration:
            if "table" in tab:
                configs.append(tab)
        return configs

    @property
    def alerts(self) -> List[Dict[str, Any]]:
        return self._content.get("alerts", [])

    @property
    def custom_search_commands(self) -> List[Dict[str, Any]]:
        return self._content.get("customSearchCommand", [])

    @property
    def meta(self) -> Dict[str, Any]:
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

    def cleanup_unwanted_params(self) -> None:
        if "_uccVersion" in self.content["meta"]:
            del self.content["meta"]["_uccVersion"]

    def add_ucc_version(self, version: str) -> None:
        self.content.setdefault("meta", {})["_uccVersion"] = version

    def has_pages(self) -> bool:
        return bool(self.pages)

    def has_inputs(self) -> bool:
        return bool(self.inputs)

    def has_configuration(self) -> bool:
        return bool(self.configuration)

    def has_alerts(self) -> bool:
        return bool(self.alerts)

    def has_custom_search_commands(self) -> bool:
        return bool(self.custom_search_commands)

    def has_dashboard(self) -> bool:
        return self.dashboard is not None

    def has_oauth(self) -> bool:
        for tab in self.configuration:
            if tab["name"] == "account":
                for entity in tab["entity"]:
                    if entity["type"] == "oauth":
                        return True
        return False
