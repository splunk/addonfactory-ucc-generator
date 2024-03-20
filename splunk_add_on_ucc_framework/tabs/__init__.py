#
# Copyright 2024 Splunk Inc.
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
from typing import Dict, Any

from splunk_add_on_ucc_framework.tabs.logging_tab import LoggingTab
from splunk_add_on_ucc_framework.tabs.tab import Tab


TAB_TYPES = [
    LoggingTab,
]


def resolve_tab(tab_definition: Dict[Any, Any]) -> Tab:
    """
    Convert the tab dictionary into a tab object. It tries to initialize every type from TAB_TYPES. If there are
    no matches, it initializes Tab class.

    Args:
        tab_definition: Tab definition. It can be a dictionary in the classic form, e.g.:
            {
                "name": "...",
                "title": "...",
                "entity": [...]
            }

            or a special component, e.g.:
            { "type": "loggingTab" }

    Returns: Tab instance or its subclass

    """
    for tab_type in TAB_TYPES:
        tab_obj = tab_type.from_definition(tab_definition)

        if tab_obj is not None:
            return tab_obj

    return Tab(tab_definition)
