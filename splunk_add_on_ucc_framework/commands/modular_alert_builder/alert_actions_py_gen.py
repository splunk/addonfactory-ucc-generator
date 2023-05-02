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
import re
from os import path as op

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

logger = logging.getLogger("ucc_gen")


class AlertActionsPyBase:
    def __init__(self, input_setting=None, package_path=None, global_settings=None):
        self._all_setting = input_setting
        self._package_path = package_path
        self._global_settings = global_settings
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
        if not self._package_path:
            return None
        return op.join(self._package_path, "bin", self.get_alert_py_name())

    def get_alert_helper_py_name(self):
        return "modalert_" + self._current_alert[ac.SHORT_NAME] + "_helper.py"

    def get_alert_helper_py_path(self):
        if not self._package_path:
            return None
        return op.join(
            self._package_path, "bin", self._lib_dir, self.get_alert_helper_py_name()
        )

    def get_template_py_files(self):
        bin_dir = op.join(self._package_path, "bin")
        return [
            op.join(bin_dir, self._lib_dir + "_declare.pyc"),
            op.join(bin_dir, self._lib_dir + "_declare.pyo"),
            op.join(bin_dir, self._lib_dir, "setup_util_helper.py"),
            op.join(bin_dir, self._lib_dir, "setup_util_helper.pyc"),
            op.join(bin_dir, self._lib_dir, "setup_util_helper.pyo"),
        ]


class AlertActionsPyGenerator(AlertActionsPyBase):
    DEFAULT_TEMPLATE_PY = "alert_action.py.template"
    DEFAULT_TEMPLATE_HELPER_PY = "alert_action_helper.py.template"

    def __init__(
        self,
        input_setting=None,
        package_path=None,
        global_settings=None,
    ):
        if not input_setting:
            msg = 'required_args="input_setting""'
            raise aae.AlertActionsInValidArgs(msg)
        super().__init__(
            input_setting=input_setting,
            package_path=package_path,
            global_settings=global_settings,
        )

        self._template = None
        self._template_py = AlertActionsPyGenerator.DEFAULT_TEMPLATE_PY
        self._template_helper_py = AlertActionsPyGenerator.DEFAULT_TEMPLATE_HELPER_PY
        logger.info("template_py=%s", self._template_py)
        self._output = {}

    def merge_py_code(self, init, new):
        if not init:
            logger.info("No previous code, don't merge new parameters in")
            return new

        start = r"\[sample_code_macro:start\]"
        end = r"\[sample_code_macro:end\]"
        start_str = "[sample_code_macro:start]"
        end_str = "[sample_code_macro:end]"
        pattern = re.compile(start + r"((.|[\r\n])*)" + end, re.MULTILINE)
        matched = pattern.search(init)
        if not matched:
            logger.info("No macro anymore, don't merge new parameters in")
            return init

        matched = pattern.search(new)
        if matched:
            new_c = matched.group(1)
            return re.sub(
                start + r"((.|[\r\n])*)" + end, start_str + new_c + end_str, init
            )

    def gen_py_file(self, one_alert_setting):
        self._current_alert = one_alert_setting
        self.gen_main_py_file()
        self.gen_helper_py_file()

    def gen_main_py_file(self):
        template = self._templates.get_template(self._template_py)

        settings = None
        if self._global_settings:
            settings = self._global_settings["settings"]
        rendered_content = template.render(
            input=self._all_setting,
            lib_name=self._lib_dir,
            mod_alert=self._current_alert,
            global_settings=settings,
            helper_name=op.splitext(self.get_alert_helper_py_name())[0],
        )

        logger.debug('operation="Writing file", file="%s"', self.get_alert_py_path())
        write_file(
            self.get_alert_py_name(),
            self.get_alert_py_path(),
            rendered_content,
        )
        name = self._current_alert[ac.SHORT_NAME]
        if not self._output.get(name):
            self._output[name] = {}
        self._output[name][self.get_alert_py_name()] = rendered_content

    def gen_helper_py_file(self):
        template = self._templates.get_template(self._template_helper_py)

        name = self._current_alert[ac.SHORT_NAME]
        init_content = None
        if self._current_alert.get("code"):
            init_content = self._current_alert.get("code")

        settings = {}
        if self._global_settings:
            settings = self._global_settings.get("settings", {})
        rendered_content = template.render(
            input=self._all_setting,
            mod_alert=self._current_alert,
            global_settings=settings,
        )

        final_content = self.merge_py_code(init_content, rendered_content)
        logger.debug('operation="Writing file", file="%s"', self.get_alert_py_path())
        write_file(
            self.get_alert_helper_py_name(),
            self.get_alert_helper_py_path(),
            final_content,
        )
        if not self._output.get(name):
            self._output[name] = {}
        self._output[name][self.get_alert_py_name(helper="_helper")] = final_content

    def handle(self):
        for alert in self._alert_actions_setting:
            logger.info(
                'operation="Generate py file", alert_action="%s"', alert[ac.SHORT_NAME]
            )
            self.gen_py_file(alert)


def generate_alert_actions_py_files(
    input_setting=None, package_path=None, global_settings=None
):
    py_gen = AlertActionsPyGenerator(
        input_setting=input_setting,
        package_path=package_path,
        global_settings=global_settings,
    )
    py_gen.handle()
    return py_gen._output
