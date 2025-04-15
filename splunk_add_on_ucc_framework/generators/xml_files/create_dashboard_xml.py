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
from typing import Any, Dict
from splunk_add_on_ucc_framework import data_ui_generator


class DashboardXml(FileGenerator):
    __description__ = (
        "Generates dashboard.xml file based on dashboard configuration present in globalConfig,"
        " in `default/data/ui/views` folder."
    )

    def _set_attributes(self, **kwargs: Any) -> None:
        if self._global_config.has_dashboard():
            self.dashboard_xml_content = data_ui_generator.generate_views_dashboard_xml(
                self._addon_name
            )

    def generate(self) -> Dict[str, str]:
        if not self._global_config.has_dashboard():
            return {"": ""}
        file_path = self.get_file_output_path(
            ["default", "data", "ui", "views", "dashboard.xml"]
        )
        self.writer(
            file_name="dashboard.xml",
            file_path=file_path,
            content=self.dashboard_xml_content,
        )
        return {"dashboard.xml": file_path}
