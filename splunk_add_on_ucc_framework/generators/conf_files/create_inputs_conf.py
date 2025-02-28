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
from typing import Any, Dict, List, Union

from splunk_add_on_ucc_framework.generators.conf_files import ConfGenerator


class InputsConf(ConfGenerator):
    __description__ = (
        "Generates `inputs.conf` and `inputs.conf.spec` "
        "file for the services mentioned in globalConfig"
    )

    def _set_attributes(self, **kwargs: Any) -> None:
        self.conf_file = "inputs.conf"
        self.conf_spec_file = f"{self.conf_file}.spec"
        self.input_names: List[Dict[str, List[str]]] = []
        self.default_value_info: Dict[str, Dict[str, str]] = {}
        if self._global_config and self._global_config.has_inputs():
            for service in self._global_config.inputs:
                properties = []
                self.default_value_info[service["name"]] = {}
                if service.get("disableNewInput"):
                    self.default_value_info[service["name"]]["disabled"] = "true"
                if service.get("conf") is not None:
                    # Add data input of self defined conf to inputs.conf.spec
                    continue
                for entity in service.get("entity", {"field": "name"}):
                    # TODO: add the details and updates on what to skip and process
                    if entity["field"] == "name":
                        continue
                    nl = "\n"  # hack for `f-string expression part cannot include a backslash`
                    # TODO: enhance the message formation for inputs.conf.spec file
                    properties.append(
                        f"{entity['field']} = {entity.get('help', '').replace(nl, ' ')} "
                        f"{'' if entity.get('defaultValue') is None else ' Default: ' + str(entity['defaultValue'])}"
                    )
                    if entity.get("defaultValue"):
                        if type(entity["defaultValue"]) is bool:
                            self.default_value_info[service["name"]].update(
                                {entity["field"]: str(entity["defaultValue"]).lower()}
                            )
                        else:
                            self.default_value_info[service["name"]].update(
                                {f"{entity['field']}": f"{str(entity['defaultValue'])}"}
                            )

                self.input_names.append({service["name"]: properties})

    def generate_conf(self) -> Union[Dict[str, str], None]:
        if not self.input_names:
            return None

        file_path = self.get_file_output_path(["default", self.conf_file])
        stanzas: List[str] = []
        for k in self.input_names:
            stanzas.extend(k.keys())
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="inputs_conf.template"
        )

        rendered_content = self._template.render(
            input_names=stanzas,
            default_values=self.default_value_info,
        )
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_file: file_path}

    def generate_conf_spec(self) -> Union[Dict[str, str], None]:
        if not self.input_names:
            return None

        file_path = self.get_file_output_path(["README", self.conf_spec_file])
        self.set_template_and_render(
            template_file_path=["README"], file_name="inputs_conf_spec.template"
        )

        rendered_content = self._template.render(
            input_stanzas=self.input_names,
        )
        self.writer(
            file_name=self.conf_spec_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_spec_file: file_path}
