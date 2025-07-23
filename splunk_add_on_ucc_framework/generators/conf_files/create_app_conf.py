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
from time import time
from typing import Dict, List

from splunk_add_on_ucc_framework.generators.file_generator import FileGenerator
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from splunk_add_on_ucc_framework.utils import get_app_manifest


class AppConf(FileGenerator):
    __description__ = (
        "Generates `app.conf` with the details mentioned in globalConfig[meta]"
    )

    def __init__(self, global_config: GlobalConfig, input_dir: str, output_dir: str):
        super().__init__(global_config, input_dir, output_dir)
        app_manifest = get_app_manifest(input_dir)
        self.description = app_manifest.get_description()
        self.title = app_manifest.get_title()
        self.author = app_manifest.get_authors()[0]["name"]
        self.conf_file = "app.conf"
        self.check_for_updates = "true"
        self.custom_conf = []
        self.name = self._addon_name
        self.id = self._addon_name
        self.supported_themes = ""

        self.custom_conf.extend(list(self._gc_schema.settings_conf_file_names))
        self.custom_conf.extend(list(self._gc_schema.configs_conf_file_names))
        self.custom_conf.extend(list(self._gc_schema.oauth_conf_file_names))

        if global_config.meta.get("checkForUpdates") is False:
            self.check_for_updates = "false"
        if global_config.meta.get("supportedThemes") is not None:
            self.supported_themes = ", ".join(global_config.meta["supportedThemes"])

        self.addon_version = global_config.version
        self.is_visible = str(
            global_config.meta.get("isVisible", global_config.has_pages())
        ).lower()
        self.build = str(int(time()))

    def generate(self) -> List[Dict[str, str]]:
        file_path = self.get_file_output_path(["default", self.conf_file])
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="app_conf.template"
        )
        rendered_content = self._template.render(
            custom_conf=self.custom_conf,
            addon_version=self.addon_version,
            check_for_updates=self.check_for_updates,
            supported_themes=self.supported_themes,
            description=self.description,
            author=self.author,
            name=self.name,
            build=self.build,
            id=self.id,
            label=self.title,
            is_visible=self.is_visible,
        )
        return [
            {
                "file_name": self.conf_file,
                "file_path": file_path,
                "content": rendered_content,
                "merge_mode": "item_overwrite",
            }
        ]
