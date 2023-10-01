#
# Copyright 2023 Splunk Inc.
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
import logging
import os
from os import linesep
from os import path as op
from typing import Dict, Any

from jinja2 import Environment, FileSystemLoader

from splunk_add_on_ucc_framework.commands.modular_alert_builder import (
    arf_consts as ac,
)
from splunk_add_on_ucc_framework.commands.modular_alert_builder.alert_actions_helper import (
    write_file,
)
from splunk_add_on_ucc_framework.commands.modular_alert_builder.alert_actions_merge import (
    remove_alert_from_conf_file,
)

logger = logging.getLogger("ucc_gen")


class AlertActionsConfGeneration:
    def __init__(
        self,
        input_setting: Dict[str, Any],
        package_path: str,
    ) -> None:
        self._alert_conf_name = "alert_actions.conf"
        self._alert_spec_name = "alert_actions.conf.spec"
        self._eventtypes_conf = "eventtypes.conf"
        self._tags_conf = "tags.conf"
        self._alert_settings = input_setting[ac.MODULAR_ALERTS]
        self._package_path = package_path
        # nosemgrep: splunk.autoescape-disabled, python.jinja2.security.audit.autoescape-disabled.autoescape-disabled
        self._templates = Environment(
            loader=FileSystemLoader(
                op.join(op.dirname(op.realpath(__file__)), "arf_template")
            ),
            trim_blocks=True,
            lstrip_blocks=True,
            keep_trailing_newline=True,
        )
        self._html_fields = [ac.PARAMETERS]
        self._default_conf_settings = {
            "python.version": "python3",
            "is_custom": 1,
            "payload_format": "json",
            "icon_path": "alerticon.png",
        }

    def get_local_conf_file_path(self, conf_name: str) -> str:
        local_path = op.join(self._package_path, "default")
        if not op.exists(local_path):
            os.makedirs(local_path)

        return op.join(local_path, conf_name)

    def get_spec_file_path(self) -> str:
        readme_path = op.join(self._package_path, "README")
        if not op.exists(readme_path):
            os.makedirs(readme_path)
        return op.join(readme_path, self._alert_spec_name)

    def generate_conf(self) -> None:
        logger.info(
            'status="starting", operation="generate", '
            + 'object="alert_actions.conf", object_type="file"'
        )
        template = self._templates.get_template("alert_actions.conf.template")
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
            ]
        )
        alerts: Dict[str, Any] = {}
        for alert in self._alert_settings:
            alert_name = alert["short_name"]
            alerts[alert_name] = []
            for k, v in alert.items():
                if k == "active_response":
                    new_cam = {
                        sub_k: sub_v
                        for sub_k, sub_v in list(v.items())
                        if sub_k != "sourcetype" and sub_v
                    }
                    value = f"param._cam = {json.dumps(new_cam)}"
                    alerts[alert_name].append(value)
                elif k == "alert_props":
                    for pk, pv in v.items():
                        value = f"{str(pk).strip()} = {str(pv).strip()}"
                        alerts[alert_name].append(value)
                elif k not in deny_list:
                    value = f"{str(k).strip()} = {str(v).strip()}"
                    alerts[alert_name].append(value)
            for k, v in alert.items():
                if k == "parameters":
                    for param in v:
                        param_name = param["name"].strip()
                        if param.get("default_value") is not None:
                            param_default_value = str(
                                param.get("default_value")
                            ).strip()
                            alerts[alert_name].append(
                                f"param.{param_name} = {param_default_value}"
                            )
                        else:
                            alerts[alert_name].append(f"param.{param_name} = ")
        final_string = template.render(alerts=alerts)
        text = linesep.join([s.strip() for s in final_string.splitlines()])
        write_file(
            self._alert_conf_name,
            self.get_local_conf_file_path(self._alert_conf_name),
            text,
        )
        logger.info(
            'status="success", operation="generate", '
            + 'object="alert_actions.conf", object_type="file"'
        )

    def generate_eventtypes(self) -> None:
        logger.info(
            'status="starting", operation="generate", '
            + 'object="eventtypes.conf", object_type="file"'
        )
        template = self._templates.get_template("eventtypes.conf.template")
        final_string = template.render(mod_alerts=self._alert_settings)
        text = linesep.join([s.strip() for s in final_string.splitlines()])
        file_path = self.get_local_conf_file_path(self._eventtypes_conf)
        write_file(self._eventtypes_conf, file_path, text)

        # remove the stanza if not checked
        for alert in self._alert_settings:
            if alert.get("active_response") and alert["active_response"].get(
                "sourcetype"
            ):
                continue
            remove_alert_from_conf_file(alert, file_path)
        logger.info(
            'status="success", operation="generate", '
            + 'object="eventtypes.conf", object_type="file"'
        )

    def generate_tags(self) -> None:
        logger.info(
            'status="starting", operation="generate", '
            + 'object="tags.conf", object_type="file"'
        )
        template = self._templates.get_template("tags.conf.template")
        final_string = template.render(mod_alerts=self._alert_settings)
        text = linesep.join([s.strip() for s in final_string.splitlines()])
        file_path = self.get_local_conf_file_path(self._tags_conf)
        write_file(self._tags_conf, file_path, text)

        # remove the stanza if not checked
        for alert in self._alert_settings:
            if alert.get("active_response") and alert["active_response"].get(
                "sourcetype"
            ):
                continue
            remove_alert_from_conf_file(alert, file_path)
        logger.info(
            'status="success", operation="generate", '
            + 'object="tags.conf", object_type="file"'
        )

    def generate_spec(self) -> None:
        logger.info(
            'status="starting", operation="generate", '
            + 'object="alert_actions.conf.spec", object_type="file"'
        )
        template = self._templates.get_template("alert_actions.conf.spec.template")
        _router = {
            "dropdownlist": "list",
            "text": "string",
            "textarea": "string",
            "checkbox": "bool",
            "password": "password",
            "dropdownlist_splunk_search": "list",
            "radio": "list",
        }
        alerts: Dict[str, Any] = {}
        for alert in self._alert_settings:
            alert_name = alert["short_name"]
            alerts[alert_name] = []
            for k, v in alert.items():
                if k == "active_response":
                    alerts[alert_name].append(
                        "param._cam = <json> Active response parameters."
                    )
                elif k == "parameters":
                    for param in v:
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
                        alerts[alert_name].append(value)
        final_string = template.render(alerts=alerts)
        text = linesep.join([s.strip() for s in final_string.splitlines()])
        write_file(self._alert_spec_name, self.get_spec_file_path(), text)
        logger.info(
            'status="success", operation="generate", '
            + 'object="alert_actions.conf.spec", object_type="file"'
        )

    def handle(self) -> None:
        self.add_default_settings()
        self.generate_conf()
        self.generate_spec()
        self.generate_eventtypes()
        self.generate_tags()

    def add_default_settings(self) -> None:
        for alert in self._alert_settings:
            if ac.ALERT_PROPS not in list(alert.keys()):
                alert[ac.ALERT_PROPS] = {}
            for k, v in list(self._default_conf_settings.items()):
                if k in list(alert[ac.ALERT_PROPS].keys()):
                    continue

                alert[ac.ALERT_PROPS][k] = v
                logger.info(
                    'status="success", operation="Add default setting", alert_name="%s", "%s"="%s"',
                    alert[ac.SHORT_NAME],
                    k,
                    v,
                )
