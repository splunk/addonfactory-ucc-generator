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
from splunk_add_on_ucc_framework.generators.globalConfig_generator import (
    GlobalConfigGenerator,
)
from typing import Any, Dict, Union
import os
import addonfactory_splunk_conf_parser_lib as conf_parser


class MinimalGlobalConfig(GlobalConfigGenerator):
    __description__ = (
        "Generates globalConfig.json file in the source code if "
        "globalConfig is not present in source directory at build time."
    )

    def _set_attributes(self, **kwargs: Any) -> None:
        if self._global_config is None:
            app_conf_path = os.path.join(self._input_dir, "default", "app.conf")
            app_conf = conf_parser.TABConfigParser()
            app_conf.read(app_conf_path)
            app_conf_content = app_conf.item_dict()
            self.check_for_update = app_conf_content.get("package", {}).get(
                "check_for_updates", ""
            )
            self.supported_themes = app_conf_content.get("ui", {}).get(
                "supported_themes", ""
            )
            if self.supported_themes:
                self.supported_themes = (
                    "["
                    + ", ".join(
                        f'"{item.strip()}"' for item in self.supported_themes.split(",")
                    )
                    + "]"
                )
            self.addon_name = kwargs["app_manifest"].get_addon_name()
            self.addon_version = kwargs["app_manifest"].get_addon_version()
            self.addon_display_name = kwargs["app_manifest"].get_title()

    def generate_globalconfig(self) -> Union[Dict[str, str], None]:
        if self._global_config is not None:
            return None
        file_path = os.path.join(self._input_dir, os.pardir, "globalConfig.json")
        self.set_template_and_render(
            template_file_path=["minimal_globalConfig"],
            file_name="minimal_globalConfig.json.template",
        )
        rendered_content = self._template.render(
            addon_name=self.addon_name,
            addon_version=self.addon_version,
            addon_display_name=self.addon_display_name,
            check_for_update=self.check_for_update,
            supported_themes=self.supported_themes,
        )
        self.writer(
            file_name="globalConfig.json",
            file_path=file_path,
            content=rendered_content,
        )
        return {"globalConfig.json": file_path}
