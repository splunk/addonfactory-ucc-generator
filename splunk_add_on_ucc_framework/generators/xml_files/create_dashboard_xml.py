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
from typing import Optional
from xml.etree.ElementTree import Element, SubElement, tostring
from splunk_add_on_ucc_framework.utils import pretty_print_xml
from splunk_add_on_ucc_framework.global_config import GlobalConfig


class DashboardXml(FileGenerator):
    __description__ = (
        "Generates dashboard.xml file based on dashboard configuration present in globalConfig,"
        " in `default/data/ui/views` folder."
    )

    def __init__(
        self, global_config: GlobalConfig, input_dir: str, output_dir: str
    ) -> None:
        super().__init__(global_config, input_dir, output_dir)
        if global_config.has_dashboard():
            self.dashboard_xml_content = self.generate_views_dashboard_xml(
                self._addon_name
            )

    def generate_views_dashboard_xml(self, addon_name: str) -> str:
        """
        Generates `default/data/ui/views/dashboard.xml` file.
        """
        view = Element(
            "view",
            attrib={
                "template": f"{addon_name}:/templates/base.html",
                "type": "html",
                "isDashboard": "False",
            },
        )
        label = SubElement(view, "label")
        label.text = "Monitoring Dashboard"
        view_as_string = tostring(view, encoding="unicode")
        return pretty_print_xml(view_as_string)

    def generate(self) -> Optional[list[dict[str, str]]]:
        if not self._global_config.has_dashboard():
            return None
        file_path = self.get_file_output_path(
            ["default", "data", "ui", "views", "dashboard.xml"]
        )
        return [
            {
                "file_name": "dashboard.xml",
                "file_path": file_path,
                "content": self.dashboard_xml_content,
            }
        ]
