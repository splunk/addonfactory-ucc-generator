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
from splunk_add_on_ucc_framework.generators.xml_files import XMLGenerator
from typing import Any, Dict
from splunk_add_on_ucc_framework import data_ui_generator


class ConfigurationXml(XMLGenerator):
    __description__ = "Generates configuration.xml file in `default/data/ui/views/` folder if globalConfig is present."

    def _set_attributes(self, **kwargs: Any) -> None:
        self.configuration_xml_content = (
            data_ui_generator.generate_views_configuration_xml(
                self._addon_name,
            )
        )

    def generate_xml(self) -> Dict[str, str]:
        file_path = self.get_file_output_path(
            ["default", "data", "ui", "views", "configuration.xml"]
        )
        self.writer(
            file_name="configuration.xml",
            file_path=file_path,
            content=self.configuration_xml_content,
        )
        return {"configuration.xml": file_path}
