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
from typing import Dict, List, Optional
import os
from xml.etree.ElementTree import Element, SubElement, tostring
from splunk_add_on_ucc_framework.utils import pretty_print_xml
from splunk_add_on_ucc_framework.global_config import GlobalConfig
import logging

logger = logging.getLogger("ucc_gen")


class DefaultXml(FileGenerator):
    __description__ = (
        "Generates default.xml file based on configs present in globalConfig,"
        " in `default/data/ui/nav` folder."
    )

    def __init__(
        self, global_config: GlobalConfig, input_dir: str, output_dir: str
    ) -> None:
        super().__init__(global_config, input_dir, output_dir)
        addon_name = self._addon_name
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
            if global_config.has_pages():
                self.default_xml_content = self.generate_nav_default_xml(
                    include_inputs=global_config.has_inputs(),
                    include_dashboard=global_config.has_dashboard(),
                    include_configuration=global_config.has_configuration(),
                    default_view=global_config.meta.get("defaultView"),
                )

    def generate_nav_default_xml(
        self,
        include_inputs: bool,
        include_dashboard: bool,
        include_configuration: bool,
        default_view: Optional[str],
    ) -> str:
        """
        Generates `default/data/ui/nav/default.xml` file.

        The validation is being done in `_validate_meta_default_view` function from `global_config_validator.py` file.
        """
        nav = Element("nav")
        if default_view is None:
            # we do this calculation as all the below properties are now optional
            if include_configuration:
                default_view = "configuration"
            elif include_inputs:
                default_view = "inputs"
            elif include_dashboard:
                default_view = "dashboard"
            else:
                default_view = "search"

        if include_inputs:
            if default_view == "inputs":
                SubElement(nav, "view", attrib={"name": "inputs", "default": "true"})
            else:
                SubElement(nav, "view", attrib={"name": "inputs"})

        if include_configuration:
            if default_view == "configuration":
                SubElement(
                    nav, "view", attrib={"name": "configuration", "default": "true"}
                )
            else:
                SubElement(nav, "view", attrib={"name": "configuration"})

        if include_dashboard:
            if default_view == "dashboard":
                SubElement(nav, "view", attrib={"name": "dashboard", "default": "true"})
            else:
                SubElement(nav, "view", attrib={"name": "dashboard"})

        if default_view == "search":
            SubElement(nav, "view", attrib={"name": "search", "default": "true"})
        else:
            SubElement(nav, "view", attrib={"name": "search"})

        nav_as_string = tostring(nav, encoding="unicode")
        return pretty_print_xml(nav_as_string)

    def generate(self) -> Optional[List[Dict[str, str]]]:
        if not self._global_config.has_pages():
            return None
        file_path = self.get_file_output_path(
            ["default", "data", "ui", "nav", "default.xml"]
        )
        return [
            {
                "file_name": "default.xml",
                "file_path": file_path,
                "content": self.default_xml_content,
            }
        ]
