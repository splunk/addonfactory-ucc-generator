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

import os.path as op


class AlertActionsTemplateMgr:
    CURRENT_DIR = op.dirname(op.abspath(__file__))
    DEFAULT_TEMPLATE_DIR = op.join(CURRENT_DIR, "arf_template")
    DEFAULT_HTML_LOOKUP_DIR = op.join(DEFAULT_TEMPLATE_DIR, "default_html_theme")

    def __init__(self, template_dir=None, html_theme=None):
        self._template_dir = (
            template_dir or AlertActionsTemplateMgr.DEFAULT_TEMPLATE_DIR
        )
        self._html_theme = html_theme or AlertActionsTemplateMgr.DEFAULT_HTML_LOOKUP_DIR

    def get_template_dir(self):
        return self._template_dir

    def get_html_lookup_dir(self):
        return self._html_theme
