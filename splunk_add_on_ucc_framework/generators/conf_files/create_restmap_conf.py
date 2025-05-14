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


class RestMapConf(FileGenerator):
    __description__ = (
        "Generates `restmap.conf` for the custom REST handlers that "
        "are generated based on configs from globalConfig"
    )

    def _set_attributes(self, **kwargs: Any) -> None:
        self.conf_file = "restmap.conf"
        self.endpoints: List[Union[RestEndpointBuilder, EndpointRegistrationEntry]] = []

        if self._global_config.has_pages():
            self.endpoints.extend(self._gc_schema.endpoints)
            self.namespace = self._gc_schema.namespace
            self.endpoints.extend(
                self._global_config.user_defined_handlers.endpoint_registration_entries
            )

        self.endpoint_names = ", ".join(sorted([ep.name for ep in self.endpoints]))

    def generate(self) -> Dict[str, str]:
        if not self.endpoints:
            return {}

        file_path = self.get_file_output_path(["default", self.conf_file])
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="restmap_conf.template"
        )
        rendered_content = self._template.render(
            endpoints=self.endpoints,
            endpoint_names=self.endpoint_names,
            namespace=self.namespace,
        )
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_file: file_path}
