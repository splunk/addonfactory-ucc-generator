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
import json
import shutil
from os import path
from typing import Any, Dict

from splunk_add_on_ucc_framework.commands.modular_alert_builder import normalize
from splunk_add_on_ucc_framework.generators.file_generator import FileGenerator


class AlertActionsConf(FileGenerator):
    __description__ = (
        "Generates `alert_actions.conf` and `alert_actions.conf.spec` file "
        "for the custom alert actions defined in globalConfig"
    )

    def _set_attributes(self, **kwargs: Any) -> None:
        self.conf_file = "alert_actions.conf"
        self.conf_spec_file = f"{self.conf_file}.spec"
        if self._global_config is None:
            return

        envs = normalize.normalize(
            self._global_config.alerts,
            self._global_config.namespace,
        )
        schema_content = envs["schema.content"]
        self._alert_settings = schema_content["modular_alerts"]

        deny_list = frozenset(
            [
                "short_name",
                "alert_props",
                "parameters",
                "uuid",
                "code",
                "largeIcon",
                "smallIcon",
                "index",
                "iconFileName",  # it is a config from globalConfig that gets written to icon_path
                "customScript",  # it is a config from globalConfig only for Python script
            ]
        )
        _router = {
            "dropdownlist": "list",
            "text": "string",
            "textarea": "string",
            "checkbox": "bool",
            "password": "password",
            "dropdownlist_splunk_search": "list",
            "radio": "list",
        }

        self.alerts: Dict[str, Any] = {}
        self.alerts_spec: Dict[str, Any] = {}

        for alert in self._alert_settings:
            alert_name = alert["short_name"]
            self.alerts[alert_name] = []
            self.alerts_spec[alert_name] = []
            # process the 'iconFileName' property for alert actions
            if alert.get("iconFileName", "alerticon.png") != "alerticon.png":
                self.alerts[alert_name].append(f"icon_path = {alert['iconFileName']}")
            else:
                self.alerts[alert_name].append("icon_path = alerticon.png")
                # we copy UCC framework's alerticon.png only when a custom isn't provided
                shutil.copy(
                    path.join(kwargs["ucc_dir"], "static", "alerticon.png"),
                    path.join(self._get_output_dir(), "appserver", "static"),
                )
            # process alert action properties in bulk
            for k, v in alert.items():
                if k == "adaptive_response":
                    new_cam = {
                        sub_k: sub_v
                        for sub_k, sub_v in list(v.items())
                        if sub_k != "sourcetype" and sub_v
                    }
                    value = f"param._cam = {json.dumps(new_cam)}"
                    self.alerts[alert_name].append(value)
                    self.alerts_spec[alert_name].append(
                        "param._cam = <json> Adaptive Response parameters."
                    )
                elif k == "parameters":
                    for param in v:
                        param_name = param["name"].strip()
                        if param.get("default_value") is not None:
                            self.alerts[alert_name].append(
                                f"param.{param_name} = {str(param['default_value']).strip()}"
                            )
                        else:
                            self.alerts[alert_name].append(f"param.{param_name} = ")

                        # fetching details for alert_actions.conf.spec file
                        format_type = _router[param["format_type"]]
                        is_required = (
                            "It's a required parameter."
                            if param.get("required") and param["required"]
                            else ""
                        )
                        param_default_value = param.get("default_value")
                        default_value = (
                            f"It's default value is {param_default_value}."
                            if param_default_value
                            else ""
                        )
                        value = (
                            f'param.{param["name"]} = <{format_type}> '
                            f'{param["label"]}. {is_required} {default_value}'
                        )
                        self.alerts_spec[alert_name].append(value)
                elif k not in deny_list:
                    value = f"{str(k).strip()} = {str(v).strip()}"
                    self.alerts[alert_name].append(value)

    def generate(self) -> Dict[str, str]:
        conf_files: Dict[str, str] = {}
        conf_files.update(self.generate_conf())
        conf_files.update(self.generate_conf_spec())
        return conf_files

    def generate_conf(self) -> Dict[str, str]:
        if not self.alerts:
            return {}

        file_path = self.get_file_output_path(["default", self.conf_file])
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="alert_actions_conf.template"
        )
        rendered_content = self._template.render(alerts=self.alerts)
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_file: file_path}

    def generate_conf_spec(self) -> Dict[str, str]:
        if not self.alerts_spec:
            return {}

        file_path = self.get_file_output_path(["README", self.conf_spec_file])
        self.set_template_and_render(
            template_file_path=["README"],
            file_name="alert_actions_conf_spec.template",
        )
        rendered_content = self._template.render(alerts=self.alerts_spec)
        self.writer(
            file_name=self.conf_spec_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_spec_file: file_path}
