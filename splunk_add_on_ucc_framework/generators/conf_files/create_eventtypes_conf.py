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
from typing import Any, Dict, List

from splunk_add_on_ucc_framework.commands.modular_alert_builder import normalize
from splunk_add_on_ucc_framework.generators.file_generator import FileGenerator


class EventtypesConf(FileGenerator):
    __description__ = (
        "Generates `eventtypes.conf` file if the sourcetype is mentioned"
        " in Adaptive Response of custom alert action in globalConfig"
    )

    def _set_attributes(self, **kwargs: Any) -> None:
        self.conf_file = "eventtypes.conf"
        self.alert_settings: Dict[str, List[Dict[str, Any]]] = {}
        envs = normalize.normalize(
            self._global_config.alerts,
            self._global_config.namespace,
        )
        schema_content = envs["schema.content"]
        self.alert_settings = schema_content["modular_alerts"]

    def generate(self) -> Dict[str, str]:
        if not self.alert_settings:
            return {}

        file_path = self.get_file_output_path(["default", self.conf_file])
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="eventtypes_conf.template"
        )
        rendered_content = self._template.render(mod_alerts=self.alert_settings)
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_file: file_path}
