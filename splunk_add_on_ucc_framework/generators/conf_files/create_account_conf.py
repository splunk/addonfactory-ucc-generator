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
from typing import Any, Tuple, List, Dict, Union

from splunk_add_on_ucc_framework.generators.conf_files import ConfGenerator


class AccountConf(ConfGenerator):
    __description__ = (
        "Generates `<YOUR_ADDON_NAME>_account.conf.spec` "
        "file for the configuration mentioned in globalConfig"
    )

    def _set_attributes(self, **kwargs: Any) -> None:
        self.account_fields: List[Tuple[str, List[str]]] = []
        if self._global_config and self._gc_schema:
            self.conf_spec_file = (
                self._global_config.namespace.lower() + "_account.conf.spec"
            )
            for account in self._global_config.configs:
                # If the endpoint is oauth, which is for getting access_token, conf file entries
                # should not get created (compatibility to previous versions)
                if account["name"] == "oauth":
                    continue
                content = self._gc_schema._get_oauth_enitities(account["entity"])
                fields, special_fields = self._gc_schema._parse_fields(content)
                self.account_fields.append(
                    ("<name>", [f"{f._name} = " for f in fields])
                )

    def generate_conf_spec(self) -> Union[Dict[str, str], None]:
        if not self.account_fields:
            return None

        file_path = self.get_file_output_path(["README", self.conf_spec_file])
        self.set_template_and_render(
            template_file_path=["README"], file_name="account_conf_spec.template"
        )

        rendered_content = self._template.render(account_stanzas=self.account_fields)
        self.writer(
            file_name=self.conf_spec_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_spec_file: file_path}
