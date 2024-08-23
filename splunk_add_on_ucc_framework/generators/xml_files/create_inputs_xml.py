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
from typing import Any, Dict, Union
from splunk_add_on_ucc_framework import data_ui_generator


class InputsXml(XMLGenerator):
    __description__ = (
        "Generates inputs.xml based on inputs configuration present in globalConfig,"
        " in `default/data/ui/views/inputs.xml` folder"
    )

    def _set_attributes(self, **kwargs: Any) -> None:
        if self._global_config and self._global_config.has_inputs():
            self.inputs_xml_content = data_ui_generator.generate_views_inputs_xml(
                self._addon_name,
            )

    def generate_xml(self) -> Union[Dict[str, str], None]:
        if self._global_config and not self._global_config.has_inputs():
            return None
        file_path = self.get_file_output_path(
            ["default", "data", "ui", "views", "inputs.xml"]
        )
        self.writer(
            file_name="inputs.xml",
            file_path=file_path,
            content=self.inputs_xml_content,
        )
        return {"inputs.xml": file_path}
