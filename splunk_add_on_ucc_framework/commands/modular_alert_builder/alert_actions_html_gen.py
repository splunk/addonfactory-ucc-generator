#
# Copyright 2021 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import logging
import os
from os import linesep
from os import path as op
from re import search
from typing import Dict, Any

from jinja2 import Environment, FileSystemLoader

from splunk_add_on_ucc_framework.commands.modular_alert_builder import (
    arf_consts as ac,
)
from splunk_add_on_ucc_framework.commands.modular_alert_builder.alert_actions_helper import (
    write_file,
)

logger = logging.getLogger("ucc_gen")


class AlertHtmlGenerator:
    def __init__(
        self,
        input_setting,
        package_path,
    ):
        self._all_setting = input_setting
        self._package_path = package_path
        # nosemgrep: splunk.autoescape-disabled, python.jinja2.security.audit.autoescape-disabled.autoescape-disabled
        self._templates = Environment(
            loader=FileSystemLoader(
                [
                    op.join(
                        op.dirname(op.realpath(__file__)),
                        "arf_template",
                        "default_html_theme",
                    ),
                    op.join(op.dirname(op.realpath(__file__)), "arf_template"),
                ]
            ),
            trim_blocks=True,
            lstrip_blocks=True,
            keep_trailing_newline=True,
        )
        self._alert_actions_setting = input_setting[ac.MODULAR_ALERTS]
        self._html_template = self._templates.get_template("mod_alert.html.template")
        self._html_home = "default.html"

    def get_alert_html_name(self, alert: Dict[str, Any]) -> str:
        return alert[ac.SHORT_NAME] + ".html"

    def get_alert_html_path(self, alert: Dict[str, Any]) -> str:
        html_path = op.join(self._package_path, "default", "data", "ui", "alerts")
        if not op.exists(html_path):
            os.makedirs(html_path)

        return op.join(html_path, self.get_alert_html_name(alert))

    def handle_alert(self, alert: Dict[str, Any]) -> None:
        rendered = self._html_template.render(
            mod_alert=alert, home_page=self._html_home
        )
        text = linesep.join(
            [s for s in rendered.splitlines() if not search(r"^\s*$", s)]
        )

        logger.info(f"Creating file @ {self.get_alert_html_path(alert)}")

        write_file(
            self.get_alert_html_name(alert),
            self.get_alert_html_path(alert),
            text,
        )

    def handle(self):
        logger.info("Started generating alert actions HTML files")
        for alert in self._alert_actions_setting:
            alert_short_name = alert["short_name"]
            logger.info(f"Generating HTML file for '{alert_short_name}'")
            self.handle_alert(alert)
        logger.info("Finished generating alert actions HTML files")
