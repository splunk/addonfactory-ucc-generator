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
from collections import defaultdict
from typing import Any, Dict, List

from splunk_add_on_ucc_framework.generators.file_generator import FileGenerator


class InputsConf(FileGenerator):
    __description__ = (
        "Generates `inputs.conf` and `inputs.conf.spec` "
        "file for the services mentioned in globalConfig"
    )

    def _conf_file_name(self, conf_name: str) -> str:
        return f"{conf_name}.conf"

    def _spec_file_name(self, conf_name: str) -> str:
        return f"{self._conf_file_name(conf_name)}.spec"

    def _set_attributes(self, **kwargs: Any) -> None:
        self.conf_file = self._conf_file_name("inputs")

        # A list of service names from globalConfig that will be in inputs.conf
        self.inputs_conf_names: List[str] = []
        # A dictionary of dictionaries of default properties for each service in inputs.conf
        self.inputs_conf_params: Dict[str, Dict[str, Any]] = defaultdict(
            lambda: defaultdict(dict)
        )

        # A dictionary of lists of properties for each service in inputs.conf
        self.inputs_conf_spec: Dict[str, List[str]] = defaultdict(list)
        # A dictionary of lists of properties for each service in their own spec files
        # (i.e. dict key is the spec file name)
        self.other_spec_files: Dict[str, List[str]] = defaultdict(list)

        if not self._global_config.has_inputs():
            return

        for service in self._global_config.inputs:
            default_values = None

            # If the service has a conf property, it will be in a separate spec file
            # Otherwise, it will be in inputs.conf
            if service.get("conf") is not None:
                spec_properties = self.other_spec_files[service["conf"]]
            else:
                spec_properties = self.inputs_conf_spec[service["name"]]
                default_values = self.inputs_conf_params[service["name"]]

            # Always add the service name to the list of service names in inputs.conf
            # to add at least the Python version
            self.inputs_conf_names.append(service["name"])

            if default_values is not None and service.get("disableNewInput"):
                default_values["disabled"] = "true"

            for entity in service.get("entity", []):
                field_name = entity["field"]

                # Skip the name field as it is already in the service name
                if field_name == "name":
                    continue

                # Construct the property spec description
                field_value_parts = []

                if entity.get("help"):
                    field_value_parts.append(entity["help"].replace("\n", " "))

                field_default_value = entity.get("defaultValue")

                if field_default_value:
                    # Convert boolean values to lowercase strings
                    if type(field_default_value) is bool:
                        value = str(field_default_value).lower()
                    else:
                        value = str(field_default_value)

                    # Add the default value to the description and dictionary
                    if default_values is not None:
                        default_values[field_name] = value
                    field_value_parts.append(f"(Default: {value})")

                field_value = " ".join(field_value_parts)
                prop = f"{field_name} = {field_value}".rstrip()
                spec_properties.append(prop)

    def generate(self) -> Dict[str, str]:
        conf_files: Dict[str, str] = {}
        conf_files.update(self.generate_conf())
        conf_files.update(self.generate_conf_spec())
        return conf_files

    def generate_conf(self) -> Dict[str, str]:
        if not self.inputs_conf_names:
            return {}

        file_path = self.get_file_output_path(["default", self.conf_file])
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="inputs_conf.template"
        )

        rendered_content = self._template.render(
            input_names=self.inputs_conf_names,
            default_values=self.inputs_conf_params,
        )
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_file: file_path}

    def _generate_spec_inputs(self) -> Dict[str, str]:
        if not self.inputs_conf_spec:
            return {}

        spec_file = self._spec_file_name("inputs")
        file_path = self.get_file_output_path(["README", spec_file])

        self.set_template_and_render(
            template_file_path=["README"], file_name="inputs_conf_spec.template"
        )

        rendered_content = self._template.render(
            input_names=self.inputs_conf_names,
            input_stanzas=self.inputs_conf_spec,
        )
        self.writer(
            file_name=spec_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {spec_file: file_path}

    def _generate_spec_other(self, name: str, parameters: List[str]) -> Dict[str, str]:
        spec_file = self._spec_file_name(name)
        file_path = self.get_file_output_path(["README", spec_file])

        content = ["[<name>]"]
        content.extend(parameters)

        self.writer(
            file_name=spec_file,
            file_path=file_path,
            content="\n".join(content),
        )
        return {spec_file: file_path}

    def generate_conf_spec(self) -> Dict[str, str]:
        files = self._generate_spec_inputs()

        for name, params in self.other_spec_files.items():
            files.update(self._generate_spec_other(name, params))

        if not files:
            return {}

        return files
