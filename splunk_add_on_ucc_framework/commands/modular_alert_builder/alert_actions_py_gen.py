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

from jinja2 import Environment, FileSystemLoader

from splunk_add_on_ucc_framework.commands.modular_alert_builder import (
    arf_consts as ac,
)
from splunk_add_on_ucc_framework.commands.modular_alert_builder.alert_actions_helper import (
    write_file,
)

logger = logging.getLogger("ucc_gen")


class AlertActionsPyBase:
    def __init__(self, addon_name: str, input_setting, package_path):
        self._addon_name = addon_name
        self._all_setting = input_setting
        self._package_path = package_path
        self._current_alert = None
        self._alert_actions_setting = input_setting[ac.MODULAR_ALERTS]
        self._ta_name = self._all_setting.get(ac.SHORT_NAME)
        self._lib_dir = self.get_python_lib_dir_name(self._ta_name)
        # nosemgrep: splunk.autoescape-disabled, python.jinja2.security.audit.autoescape-disabled.autoescape-disabled
        self._templates = Environment(
            loader=FileSystemLoader(
                op.join(op.dirname(op.realpath(__file__)), "arf_template")
            ),
            trim_blocks=True,
            lstrip_blocks=True,
            keep_trailing_newline=True,
        )

    def get_python_lib_dir_name(self, app_name):
        space_replace = re.compile(r"[^\w]+")
        return space_replace.sub("_", app_name.lower())

    def get_alert_py_name(self, helper=""):
        return self._current_alert[ac.SHORT_NAME] + helper + ".py"

    def get_alert_py_path(self):
        return op.join(self._package_path, "bin", self.get_alert_py_name())

    def get_alert_helper_py_name(self):
        return "modalert_" + self._current_alert[ac.SHORT_NAME] + "_helper.py"

    def get_alert_helper_py_path(self):
        return op.join(
            self._package_path, "bin", self._lib_dir, self.get_alert_helper_py_name()
        )


class AlertActionsPyGenerator(AlertActionsPyBase):
    def __init__(
        self,
        addon_name,
        input_setting,
        package_path,
    ):
        super().__init__(
            addon_name=addon_name,
            input_setting=input_setting,
            package_path=package_path,
        )

    def gen_py_file(self, one_alert_setting):
        self._current_alert = one_alert_setting
        self.gen_main_py_file()
        self.gen_helper_py_file()

    def gen_main_py_file(self):
        template = self._templates.get_template("alert_action.py.template")
        rendered_content = template.render(
            addon_name=self._addon_name,
            lib_name=self._lib_dir,
            mod_alert=self._current_alert,
            helper_name=op.splitext(self.get_alert_helper_py_name())[0],
        )
        logger.debug('operation="Writing file", file="%s"', self.get_alert_py_path())
        write_file(
            self.get_alert_py_name(),
            self.get_alert_py_path(),
            rendered_content,
        )

    def gen_helper_py_file(self):
        template = self._templates.get_template("alert_action_helper.py.template")
        rendered_content = template.render(
            input=self._all_setting,
            mod_alert=self._current_alert,
        )
        logger.debug('operation="Writing file", file="%s"', self.get_alert_py_path())
        write_file(
            self.get_alert_helper_py_name(),
            self.get_alert_helper_py_path(),
            rendered_content,
        )

    def handle(self):
        for alert in self._alert_actions_setting:
            logger.info(
                'operation="Generate py file", alert_action="%s"', alert[ac.SHORT_NAME]
            )
            self.gen_py_file(alert)
