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
from typing import Any, Dict, Union

from splunk_add_on_ucc_framework.generators.conf_files import ConfGenerator


class WebConf(ConfGenerator):
    __description__ = (
        "Generates `web.conf` to expose the endpoints generated in "
        "`restmap.conf` which is generated based on configurations from globalConfig."
    )

    def _set_attributes(self, **kwargs: Any) -> None:
        self.conf_file = "web.conf"
        if self._gc_schema:
            self.endpoints = self._gc_schema.endpoints

    def generate_conf(self) -> Union[Dict[str, str], None]:
        if not self._gc_schema:
            return None

        file_path = self.get_file_output_path(["default", self.conf_file])
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="web_conf.template"
        )
        rendered_content = self._template.render(
            endpoints=self.endpoints,
        )
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_file: file_path}
