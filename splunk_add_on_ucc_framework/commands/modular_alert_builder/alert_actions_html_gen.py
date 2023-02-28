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

from jinja2 import Environment, FileSystemLoader

from splunk_add_on_ucc_framework.commands.modular_alert_builder import (
    alert_actions_exceptions as aae,
)
from splunk_add_on_ucc_framework.commands.modular_alert_builder import (
    arf_consts as ac,
)
from splunk_add_on_ucc_framework.commands.modular_alert_builder.alert_actions_helper import (
    write_file,
)
from splunk_add_on_ucc_framework.commands.modular_alert_builder.alert_actions_template import (
    AlertActionsTemplateMgr,
)

logger = logging.getLogger("ucc_gen")


class AlertHtmlBase:
    def __init__(self, input_setting=None, package_path=None):
        self._all_setting = input_setting
        self._package_path = package_path
        self._current_alert = None
        # nosemgrep: splunk.autoescape-disabled
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

    def get_alert_html_name(self):
        return self._current_alert[ac.SHORT_NAME] + ".html"

    def get_alert_html_path(self):
        if not self._package_path:
            return None

        html_path = op.join(self._package_path, "default", "data", "ui", "alerts")
        if not op.exists(html_path):
            os.makedirs(html_path)

        return op.join(html_path, self.get_alert_html_name())


class AlertHtmlGenerator(AlertHtmlBase):
    DEFAULT_TEMPLATE_HTML = "mod_alert.html.template"
    DEFAULT_HOME_HTML = "default.html"

    def __init__(
        self,
        input_setting=None,
        package_path=None,
        html_template=None,
        html_home=None,
        html_theme=None,
    ):
        super().__init__(input_setting, package_path)
        if not input_setting:
            msg = 'required_args="input_setting"'
            raise aae.AlertActionsInValidArgs(msg)

        self._alert_actions_setting = input_setting[ac.MODULAR_ALERTS]
        self._html_template = html_template or AlertHtmlGenerator.DEFAULT_TEMPLATE_HTML
        self._html_home = html_home or AlertHtmlGenerator.DEFAULT_HOME_HTML
        self._temp_obj = AlertActionsTemplateMgr(html_theme=html_theme)
        self._html_theme = self._temp_obj.get_html_lookup_dir()
        logger.info(
            'html_theme="%s" html_template="%s", html_home="%s"',
            self._html_theme,
            self._html_template,
            self._html_home,
        )
        self._output = {}

    def handle_one_alert(self, template, one_alert_setting):
        self._current_alert = one_alert_setting
        final_form = template.render(
            mod_alert=self._current_alert, home_page=self._html_home
        )
        text = linesep.join(
            [s for s in final_form.splitlines() if not search(r"^\s*$", s)]
        )

        logger.debug(
            'operation="Write", object_type="File", object="%s"',
            self.get_alert_html_path(),
        )

        write_file(
            self.get_alert_html_name(),
            self.get_alert_html_path(),
            text,
        )
        self._output[self._current_alert["short_name"]] = text

    def handle(self):
        logger.info("html_theme=%s", self._html_theme)
        template = self._templates.get_template(self._html_template)
        logger.info("Start to generate alert actions html files")
        for alert in self._alert_actions_setting:
            self.handle_one_alert(template, alert)
        logger.info("Finished generating alert actions html files")


def generate_alert_actions_html_files(
    input_setting=None, package_path=None, html_setting=None
):
    html_template = None
    html_home = None
    html_theme = None
    if html_setting:
        html_template = html_setting.get("html_template")
        html_home = html_setting.get("html_home")
        html_theme = html_setting.get("html_theme")
    html_gen = AlertHtmlGenerator(
        input_setting=input_setting,
        package_path=package_path,
        html_template=html_template,
        html_home=html_home,
        html_theme=html_theme,
    )
    html_gen.handle()
    return html_gen._output
