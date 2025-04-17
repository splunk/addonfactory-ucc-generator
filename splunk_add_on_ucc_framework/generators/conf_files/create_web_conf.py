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
from typing import Any, Dict, Union, List

from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.base import (
    RestEndpointBuilder,
)
from splunk_add_on_ucc_framework.commands.rest_builder.user_defined_rest_handlers import (
    EndpointRegistrationEntry,
)
from splunk_add_on_ucc_framework.generators.file_generator import FileGenerator


class WebConf(FileGenerator):
    __description__ = (
        "Generates `web.conf` to expose the endpoints generated in "
        "`restmap.conf` which is generated based on configurations from globalConfig."
    )

    def _set_attributes(self, **kwargs: Any) -> None:
        pass

    def generate(self) -> Dict[str, str]:
        if not self._global_config.has_pages():
            return {}

        endpoints: List[Union[RestEndpointBuilder, EndpointRegistrationEntry]] = []
        endpoints.extend(self._gc_schema.endpoints)
        endpoints.extend(
            self._global_config.user_defined_handlers.endpoint_registration_entries
        )
        conf_file = "web.conf"

        file_path = self.get_file_output_path(["default", conf_file])
        rendered_content = self._render(
            "web_conf.template",
            endpoints=endpoints,
        )
        self.writer(
            file_name=conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {conf_file: file_path}
