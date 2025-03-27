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
from typing import Any, Dict, Union

from splunk_add_on_ucc_framework.generators.conf_files import ConfGenerator


class CommandsConf(ConfGenerator):
    __description__ = (
        "Generates `commands.conf` for custom commands provided in the globalConfig."
    )

    def _set_attributes(self, **kwargs: Any) -> None:
        self.conf_file = "commands.conf"
        if self._global_config and self._global_config.has_custom_search_commands():
            self.command_names = []
            for command in kwargs["custom_search_commands"]:
                self.command_names.append(command["commandName"])

    def generate_conf(self) -> Union[Dict[str, str], None]:
        if not (
            self._global_config and self._global_config.has_custom_search_commands()
        ):
            return None

        file_path = self.get_file_output_path(["default", self.conf_file])
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="commands.conf.template"
        )
        rendered_content = self._template.render(
            command_names=self.command_names,
        )
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_file: file_path}
