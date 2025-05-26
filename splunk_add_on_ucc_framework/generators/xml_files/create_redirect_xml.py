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


class RedirectXml(FileGenerator):
    __description__ = (
        "Generates ta_name_redirect.xml file, if oauth is mentioned in globalConfig,"
        " in `default/data/ui/views/` folder."
    )

    def _set_attributes(self, **kwargs: Any) -> None:
        if self._global_config.has_oauth():
            self.redirect_xml_content = data_ui_generator.generate_views_redirect_xml(
                self._addon_name,
            )
            self.ta_name = self._addon_name.lower()

    def generate(self) -> Dict[str, str]:
        if not self._global_config.has_oauth():
            return {}
        file_name = f"{self.ta_name}_redirect.xml"
        file_path = self.get_file_output_path(
            ["default", "data", "ui", "views", file_name]
        )
        self.writer(
            file_name=file_name,
            file_path=file_path,
            content=self.redirect_xml_content,
        )
        return {file_name: file_path}
