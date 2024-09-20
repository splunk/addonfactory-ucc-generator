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
from os.path import isfile, join
from typing import Any, Dict, Union
from splunk_add_on_ucc_framework.generators.conf_files import ConfGenerator


class ServerConf(ConfGenerator):
    __description__ = (
        "Generates `server.conf` for the custom conf "
        "files created as per configurations in globalConfig"
    )

    def _set_attributes(self, **kwargs: Any) -> None:
        self.conf_file = "server.conf"
        self.custom_conf = []
        if self._gc_schema:
            self.custom_conf.extend(list(self._gc_schema.settings_conf_file_names))
            self.custom_conf.extend(list(self._gc_schema.configs_conf_file_names))
            self.custom_conf.extend(list(self._gc_schema.oauth_conf_file_names))

    def generate_conf(self) -> Union[Dict[str, str], None]:
        if not self.custom_conf:
            return None

        file_path = self.get_file_output_path(["default", self.conf_file])
        # For now, only create server.conf only if
        # no server.conf is present in the source package.
        if isfile(join(self._input_dir, "default", self.conf_file)):
            return {"": ""}
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="server_conf.template"
        )
        rendered_content = self._template.render(custom_conf=self.custom_conf)
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_file: file_path}
