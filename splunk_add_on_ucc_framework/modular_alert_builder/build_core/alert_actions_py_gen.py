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


from builtins import object
from . import arf_consts as ac
from os import path as op
from os import remove
from munch import Munch
from mako.template import Template
from mako.lookup import TemplateLookup
from . import alert_actions_exceptions as aae
from .alert_actions_template import AlertActionsTemplateMgr
from .alert_actions_helper import write_file
import re


class AlertActionsPyBase(object):

    def __init__(self, input_setting=None, package_path=None, logger=None,
                 template_py=None, lookup_dir=None, global_settings=None,
                 **kwargs):
        self._all_setting = input_setting
        self._logger = logger
        self._package_path = package_path
        self._global_settings = global_settings
        self._current_alert = None
        self._alert_actions_setting = input_setting[ac.MODULAR_ALERTS]
        self._ta_name = self._all_setting.get(ac.SHORT_NAME)
        self._lib_dir = self.get_python_lib_dir_name(self._ta_name)

    def get_python_lib_dir_name(self, app_name):
        space_replace = re.compile('[^\w]+')
        return space_replace.sub('_', app_name.lower())

    def get_alert_py_name(self, helper=""):
        return self._current_alert[ac.SHORT_NAME] + helper + ".py"

    def get_alert_py_path(self, helper=""):
        if not self._package_path:
            return None
        return op.join(self._package_path, "bin", self.get_alert_py_name())

    def get_alert_helper_py_name(self):
        return "modalert_" + self._current_alert[ac.SHORT_NAME] + "_helper.py"

    def get_alert_helper_py_path(self):
        if not self._package_path:
            return None
        return op.join(self._package_path, "bin", self._lib_dir,
                       self.get_alert_helper_py_name())

    def get_declare_py_name(self):
        return self._lib_dir + "_declare.py"

    def get_decalre_py_path(self):
        if not self._package_path:
            return None
        bin_dir = op.join(self._package_path, "bin")
        return op.join(bin_dir, self.get_declare_py_name())

    def get_template_py_files(self):
        bin_dir = op.join(self._package_path, "bin")
        return [
#            op.join(bin_dir, self._lib_dir + "_declare.py"),
            op.join(bin_dir, self._lib_dir + "_declare.pyc"),
            op.join(bin_dir, self._lib_dir + "_declare.pyo"),
            op.join(bin_dir, self._lib_dir, "setup_util_helper.py"),
            op.join(bin_dir, self._lib_dir, "setup_util_helper.pyc"),
            op.join(bin_dir, self._lib_dir, "setup_util_helper.pyo")
        ]


class AlertActionsPyGenerator(AlertActionsPyBase):
    DEFAULT_TEMPLATE_DECLARE_PY = "python_lib_declare.py.template"
    DEFAULT_TEMPLATE_PY = "alert_action.py.template"
    DEFAULT_TEMPLATE_HELPER_PY = "alert_action_helper.py.template"
    CURRENT_DIR = op.dirname(op.abspath(__file__))
    DEFAULT_LOOKUP_DIR = op.join(CURRENT_DIR, "default_py")

    def __init__(self, input_setting=None, package_path=None, logger=None,
                 template_py=None, template_helper_py=None,
                 template_declare_py=None, lookup_dir=None,
                 global_settings=None,
                 **kwargs):
        if not input_setting or not logger:
            msg = 'required_args="input_setting, logger"'
            raise aae.AlertActionsInValidArgs(msg)
        super(AlertActionsPyGenerator, self).__init__(
            input_setting=input_setting, package_path=package_path,
            logger=logger, template_py=template_py, lookup_dir=lookup_dir,
            global_settings=global_settings, **kwargs)

        self._temp_obj = AlertActionsTemplateMgr()
        self._template = None
        self._template_py = template_py or \
            AlertActionsPyGenerator.DEFAULT_TEMPLATE_PY
        self._template_helper_py = template_helper_py or \
            AlertActionsPyGenerator.DEFAULT_TEMPLATE_HELPER_PY
        self._template_declare_py = template_declare_py or \
            AlertActionsPyGenerator.DEFAULT_TEMPLATE_DECLARE_PY
        self._lookup_dir = lookup_dir or \
            AlertActionsPyGenerator.DEFAULT_LOOKUP_DIR
        self._logger.info("template_py=%s lookup_dir=%s", self._template_py,
                          self._lookup_dir)
        self._output = {}
        self.other_setting = kwargs

    def merge_py_code(self, init, new):
        if not init:
            self._logger.info("No previous code, don't merge new parameters in")
            return new

        start = r'\[sample_code_macro:start\]'
        end = r'\[sample_code_macro:end\]'
        start_str = '[sample_code_macro:start]'
        end_str = '[sample_code_macro:end]'
        pattern = re.compile(start + r'((.|[\r\n])*)' + end,
                             re.MULTILINE)
        matched = pattern.search(init)
        if not matched:
            self._logger.info("No macro anymore, don't merge new parameters in")
            return init

        matched = pattern.search(new)
        if matched:
            new_c = matched.group(1)
            return re.sub(start + r'((.|[\r\n])*)' + end,
                          start_str + new_c + end_str,
                          init)

    def gen_py_file(self, one_alert_setting):
        self._current_alert = one_alert_setting
        self.gen_main_py_file()
        self.gen_helper_py_file()


    def gen_main_py_file(self):
        current_dir = op.dirname(op.abspath(__file__))
        lookup_dir = op.join(current_dir, "default_py")
        tmp_lookup = TemplateLookup(directories=[lookup_dir])

        template_path = self._template_py
        if not op.isabs(self._template_py):
            template_path = op.join(self._temp_obj.get_template_dir(),
                                    self._template_py)
        template = Template(filename=template_path, lookup=tmp_lookup)

        # start to render new py file
        rendered_content = None
        settings = None
        if self._global_settings:
            settings = self._global_settings["settings"]
        rendered_content = template.render(
            input=Munch.fromDict(self._all_setting),
            lib_name=self._lib_dir,
            mod_alert=Munch.fromDict(self._current_alert),
            global_settings=Munch.fromDict(settings),
            helper_name=op.splitext(self.get_alert_helper_py_name())[0]
        )

        self._logger.debug('operation="Writing file", file="%s"',
                           self.get_alert_py_path())
        write_file(self.get_alert_py_name(),
                   self.get_alert_py_path(),
                   rendered_content,
                   self._logger)

    def gen_helper_py_file(self):
        current_dir = op.dirname(op.abspath(__file__))
        lookup_dir = op.join(current_dir, "default_py")
        tmp_lookup = TemplateLookup(directories=[lookup_dir])

        template_path = self._template_helper_py
        if not op.isabs(self._template_helper_py):
            template_path = op.join(self._temp_obj.get_template_dir(),
                                    self._template_helper_py)
        template = Template(filename=template_path, lookup=tmp_lookup)

        name = self._current_alert[ac.SHORT_NAME]
        final_content = None
        rendered_content = None
        init_content = None
        if self._current_alert.get("code"):
            init_content = self._current_alert.get("code")

        # start to render new py file
        settings = {}
        if self._global_settings:
            settings = self._global_settings.get("settings", {})
        rendered_content = template.render(
            input=Munch.fromDict(self._all_setting),
            mod_alert=Munch.fromDict(self._current_alert),
            global_settings=Munch.fromDict(settings)
        )

        final_content = self.merge_py_code(init_content, rendered_content)
        self._logger.debug('operation="Writing file", file="%s"',
                           self.get_alert_py_path())
        write_file(self.get_alert_helper_py_name(),
                   self.get_alert_helper_py_path(),
                   final_content,
                   self._logger)
        if not self._output.get(name):
            self._output[name] = {}
        self._output[name][self.get_alert_py_name(helper="_helper")] = final_content

    def handle(self):
        for alert in self._alert_actions_setting:
            self._logger.info('operation="Generate py file", alert_action="%s"',
                              alert[ac.SHORT_NAME])
            self.gen_py_file(alert)


def generate_alert_actions_py_files(input_setting=None, package_path=None,
                                    logger=None, global_settings=None,
                                    **kwargs):
    py_gen = AlertActionsPyGenerator(input_setting=input_setting,
                                     package_path=package_path,
                                     logger=logger,
                                     global_settings=global_settings,
                                     **kwargs)
    py_gen.handle()
    return py_gen._output

