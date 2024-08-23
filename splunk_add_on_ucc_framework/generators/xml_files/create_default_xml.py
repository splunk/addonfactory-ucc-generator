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
from typing import Dict, Any
import os
from splunk_add_on_ucc_framework import data_ui_generator
import logging

logger = logging.getLogger("ucc_gen")


class DefaultXml(XMLGenerator):
    __description__ = (
        "Generates default.xml file based on configs present in globalConfig"
        "in in `default/data/ui/nav` folder."
    )

    def _set_attributes(self, **kwargs: Any) -> None:
        addon_name = kwargs.get("addon_name")
        if not isinstance(addon_name, str):
            raise ValueError("addon_name must be a string")
        default_ui_path = os.path.join(
            self._output_dir, addon_name, "default", "data", "ui"
        )
        default_xml_path = os.path.join(default_ui_path, "nav", "default.xml")
        if os.path.exists(default_xml_path):
            logger.info(
                "Skipping generating data/ui/nav/default.xml because file already exists."
            )
        else:
            if self._global_config:
                self.default_xml_content = data_ui_generator.generate_nav_default_xml(
                    include_inputs=self._global_config.has_inputs(),
                    include_dashboard=self._global_config.has_dashboard(),
                    default_view=self._global_config.meta.get(
                        "default_view", data_ui_generator.DEFAULT_VIEW
                    ),
                )

    def generate_xml(self) -> Dict[str, str]:
        file_path = self.get_file_output_path(
            ["default", "data", "ui", "nav", "default.xml"]
        )
        self.writer(
            file_name="default.xml",
            file_path=file_path,
            content=self.default_xml_content,
        )
        return {"default.xml": file_path}
