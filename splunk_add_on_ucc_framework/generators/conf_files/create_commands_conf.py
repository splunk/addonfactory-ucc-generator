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
from typing import Optional

from splunk_add_on_ucc_framework.generators.file_generator import FileGenerator
from splunk_add_on_ucc_framework.global_config import GlobalConfig


class CommandsConf(FileGenerator):
    __description__ = (
        "Generates `commands.conf` for custom commands provided in the globalConfig."
    )

    def __init__(
        self, global_config: GlobalConfig, input_dir: str, output_dir: str
    ) -> None:
        super().__init__(global_config, input_dir, output_dir)
        self.conf_file = "commands.conf"
        self.conf_spec_file = "commands.conf.spec"
        self.supportedPythonVersion = None
        if global_config.has_custom_search_commands():
            self.command_names = []
            for command in global_config.custom_search_commands:
                self.command_names.append(command["commandName"])
            supported_versions = self._global_config.meta.get("supportedPythonVersion")
            if supported_versions:
                self.supportedPythonVersion = ", ".join(supported_versions)

    def generate_conf(self) -> dict[str, str]:
        file_path = self.get_file_output_path(["default", self.conf_file])
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="commands_conf.template"
        )
        rendered_content = self._template.render(
            command_names=self.command_names,
            supportedPythonVersion=self.supportedPythonVersion,
        )
        return {
            "file_name": self.conf_file,
            "file_path": file_path,
            "content": rendered_content,
        }

    def generate_conf_spec(self) -> Optional[dict[str, str]]:
        if self.supportedPythonVersion:
            file_path = self.get_file_output_path(["README", self.conf_spec_file])
            self.set_template_and_render(
                template_file_path=["README"], file_name="commands_conf_spec.template"
            )
            rendered_content = self._template.render()
            return {
                "file_name": self.conf_spec_file,
                "file_path": file_path,
                "content": rendered_content,
            }
        return None

    def generate(self) -> Optional[list[dict[str, str]]]:
        if not self._global_config.has_custom_search_commands():
            return None

        conf_files: list[dict[str, str]] = []
        conf = self.generate_conf()
        conf_spec = self.generate_conf_spec()
        if conf is not None:
            conf_files.append(conf)
        if conf_spec is not None:
            conf_files.append(conf_spec)
        return conf_files
