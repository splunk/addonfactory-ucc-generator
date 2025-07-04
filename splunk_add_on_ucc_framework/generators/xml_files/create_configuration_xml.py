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
from typing import Dict
from lxml import etree as ET


class ConfigurationXml(FileGenerator):
    __description__ = (
        "Generates configuration.xml file in `default/data/ui/views/` folder if "
        "configuration is defined in globalConfig."
    )

    def generate_views_configuration_xml(self, addon_name: str) -> str:
        """
        Generates `default/data/ui/views/configuration.xml` xml content using lxml.
        """
        view = ET.Element(
            "view",
            template=f"{addon_name}:/templates/base.html",
            type="html",
            isDashboard="False",
        )

        label = ET.SubElement(view, "label")
        label.text = "Configuration"

        # Convert to pretty-printed XML string
        view_as_string = ET.tostring(view, encoding="unicode", pretty_print=True)
        return view_as_string

    def _set_attributes(self) -> None:
        if self._global_config.has_configuration():
            self.configuration_xml_content = self.generate_views_configuration_xml(
                self._addon_name,
            )

    def generate(self) -> Dict[str, str]:
        if not self._global_config.has_configuration():
            return {}
        file_path = self.get_file_output_path(
            ["default", "data", "ui", "views", "configuration.xml"]
        )
        self.writer(
            file_name="configuration.xml",
            file_path=file_path,
            content=self.configuration_xml_content,
        )
        return {"configuration.xml": file_path}
