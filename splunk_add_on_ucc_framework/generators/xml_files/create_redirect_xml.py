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
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from typing import Any, Dict
from splunk_add_on_ucc_framework import data_ui_generator


class RedirectXml(XMLGenerator):
    __description__ = (
        " Generates ta_name_redirect.xml file, if oauth is mentioned in globalConfig,"
        "in `default/data/ui/views/` folder."
    )

    def __init__(
        self,
        global_config: GlobalConfig,
        input_dir: str,
        output_dir: str,
        **kwargs: Any,
    ) -> None:
        super().__init__(global_config, input_dir, output_dir, **kwargs)

    def _set_attributes(self, **kwargs: Any) -> None:
        if self._global_config and self._global_config.has_oauth():
            self.addon_redirect_xml_content = (
                data_ui_generator.generate_views_redirect_xml(
                    kwargs["addon_name"],
                )
            )
        self.ta_name = kwargs["addon_name"].lower()

    def generate_xml(self) -> Dict[str, str]:
        if self._global_config and not self._global_config.has_oauth():
            return super().generate_xml()
        file_name = f"{self.ta_name}_redirect.xml"
        file_path = self.get_file_output_path(
            ["default", "data", "ui", "views", file_name]
        )
        self.writer(
            file_name=file_name,
            file_path=file_path,
            content=self.addon_redirect_xml_content,
        )
        return {file_name: file_path}
