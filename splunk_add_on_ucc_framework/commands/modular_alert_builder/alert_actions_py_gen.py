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
import logging
import re
from os import path as op
from typing import Any, Dict

from jinja2 import Environment, FileSystemLoader

from splunk_add_on_ucc_framework.commands.modular_alert_builder import (
    arf_consts as ac,
)
from splunk_add_on_ucc_framework.commands.modular_alert_builder.alert_actions_helper import (
    write_file,
)

logger = logging.getLogger("ucc_gen")


class AlertActionsPyGenerator:
    def __init__(
        self,
        addon_name: str,
        input_setting: Dict[str, Any],
        package_path: str,
    ) -> None:
        self._addon_name = addon_name
        self._all_setting = input_setting
        self._package_path = package_path
        self._alert_actions_setting = input_setting[ac.MODULAR_ALERTS]
        ta_name = input_setting.get(ac.SHORT_NAME)
        if ta_name is None:
            raise ValueError(
                f"{ac.SHORT_NAME} key should be present in input_settings passed"
            )
        space_replace = re.compile(r"[^\w]+")
        self._lib_dir = space_replace.sub("_", ta_name.lower())
        # nosemgrep: splunk.autoescape-disabled, python.jinja2.security.audit.autoescape-disabled.autoescape-disabled
        self._templates = Environment(
            loader=FileSystemLoader(
                op.join(op.dirname(op.realpath(__file__)), "arf_template")
            ),
            trim_blocks=True,
            lstrip_blocks=True,
            keep_trailing_newline=True,
        )

    def _get_alert_py_name(self, alert: Any) -> str:
        return alert[ac.SHORT_NAME] + ".py"

    def _get_alert_py_path(self, alert: Any) -> str:
        return op.join(self._package_path, "bin", self._get_alert_py_name(alert))

    def _get_alert_helper_py_name(self, alert: Any) -> str:
        return "modalert_" + alert[ac.SHORT_NAME] + "_helper.py"

    def _get_alert_helper_py_path(self, alert: Any) -> str:
        return op.join(
            self._package_path,
            "bin",
            self._lib_dir,
            self._get_alert_helper_py_name(alert),
        )

    def gen_main_py_file(self, alert: Any) -> None:
        template = self._templates.get_template("alert_action.py.template")
        rendered_content = template.render(
            addon_name=self._addon_name,
            lib_name=self._lib_dir,
            mod_alert=alert,
            helper_name=op.splitext(self._get_alert_helper_py_name(alert))[0],
        )
        logger.debug(f"Writing to file {self._get_alert_py_path(alert)}")
        write_file(
            self._get_alert_py_name(alert),
            self._get_alert_py_path(alert),
            rendered_content,
        )

    def gen_helper_py_file(self, alert: Any) -> None:
        template = self._templates.get_template("alert_action_helper.py.template")
        rendered_content = template.render(
            input=self._all_setting,
            mod_alert=alert,
        )
        logger.debug(f"Writing to file {self._get_alert_py_path(alert)}")
        write_file(
            self._get_alert_helper_py_name(alert),
            self._get_alert_helper_py_path(alert),
            rendered_content,
        )

    def handle(self) -> None:
        for alert in self._alert_actions_setting:
            logger.info(
                f"Generating Python file for alert action {alert[ac.SHORT_NAME]}"
            )
            self.gen_main_py_file(alert)
            self.gen_helper_py_file(alert)
