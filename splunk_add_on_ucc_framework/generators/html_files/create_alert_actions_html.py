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
from splunk_add_on_ucc_framework.generators.file_generator import FileGenerator
from splunk_add_on_ucc_framework.commands.modular_alert_builder import (
    arf_consts as ac,
    normalize,
)
from typing import Dict, Any
from os import linesep
from re import search


class AlertActionsHtml(FileGenerator):
    __description__ = (
        "Generates `alert_name.html` file based on alerts configuration present in globalConfig,"
        " in `default/data/ui/alerts` folder."
    )

    def _set_attributes(self, **kwargs: Dict[str, Any]) -> None:
        if self._global_config.has_alerts():
            self._html_home = "alert_html_skeleton.template"
            envs = normalize.normalize(
                self._global_config.alerts,
                self._global_config.namespace,
            )
            schema_content = envs["schema.content"]
            self._alert_settings = schema_content["modular_alerts"]

    def generate(self) -> Dict[str, str]:
        if not self._global_config.has_alerts():
            return {}

        alert_details: Dict[str, str] = {}
        for self.alert in self._alert_settings:
            self.set_template_and_render(
                template_file_path=["html_templates"],
                file_name="mod_alert.html.template",
            )
            rendered_content = self._template.render(
                mod_alert=self.alert, home_page=self._html_home
            )
            text = linesep.join(
                [s for s in rendered_content.splitlines() if not search(r"^\s*$", s)]
            )
            file_name = f"{self.alert[ac.SHORT_NAME] + '.html'}"
            file_path = self.get_file_output_path(
                [
                    "default",
                    "data",
                    "ui",
                    "alerts",
                    file_name,
                ]
            )
            self.writer(
                file_name=file_name,
                file_path=file_path,
                content=text,
            )
            alert_details.update({file_name: file_path})
        return alert_details
