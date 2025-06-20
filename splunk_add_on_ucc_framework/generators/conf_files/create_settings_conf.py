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
from typing import Any, Tuple, List, Dict

from splunk_add_on_ucc_framework.generators.file_generator import FileGenerator


class SettingsConf(FileGenerator):
    __description__ = (
        "Generates `<YOUR_ADDON_NAME>_settings.conf.spec` "
        "file for the Proxy, Logging or Custom Tab mentioned in globalConfig"
    )

    def _set_attributes(self, **kwargs: Any) -> None:
        self.settings_stanzas: List[Tuple[str, List[str]]] = []
        self.default_content: str = ""

        if self._global_config.has_configuration():
            self.conf_file = self._global_config.namespace.lower() + "_settings.conf"
            self.conf_spec_file = f"{self.conf_file}.spec"
            for setting in self._global_config.settings:
                content = self._gc_schema._get_oauth_enitities(
                    setting.get("entity", [])
                )
                fields, _ = self._gc_schema._parse_fields(content)
                self.settings_stanzas.append(
                    (setting["name"], [f"{f._name} = " for f in fields])
                )
                if setting.get("entity") is None:
                    # When a tab doesn't have an entity, we add newlines as
                    # done in `generate_conf_with_default_values()` function.
                    self.default_content = f"[{setting['name']}]\n\n"
            if self._gc_schema._endpoints.get("settings") is not None:
                self.default_content += self._gc_schema._endpoints[
                    "settings"
                ].generate_conf_with_default_values()

    def generate(self) -> Dict[str, str]:
        conf_files: Dict[str, str] = {}
        conf_files.update(self.generate_conf())
        conf_files.update(self.generate_conf_spec())
        return conf_files

    def generate_conf(self) -> Dict[str, str]:
        if not self.default_content:
            return {}
        file_path = self.get_file_output_path(["default", self.conf_file])
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="settings_conf.template"
        )

        rendered_content = self._template.render(default_content=self.default_content)
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_file: file_path}

    def generate_conf_spec(self) -> Dict[str, str]:
        if not self.settings_stanzas:
            return {}

        file_path = self.get_file_output_path(["README", self.conf_spec_file])
        self.set_template_and_render(
            template_file_path=["README"], file_name="settings_conf_spec.template"
        )

        rendered_content = self._template.render(settings_stanzas=self.settings_stanzas)
        self.writer(
            file_name=self.conf_spec_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_spec_file: file_path}
