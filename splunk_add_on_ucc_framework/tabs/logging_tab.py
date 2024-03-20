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
from typing import Dict, List, Any, Optional

from splunk_add_on_ucc_framework.tabs.tab import Tab


# defaults
NAME = "logging"
TITLE = "Logging"
LEVELS = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
FIELD = "loglevel"
LABEL = "Log level"
DEFAULTLEVEL = "INFO"


class LoggingTab(Tab):
    @property
    def name(self) -> str:
        return self.get("name", NAME)

    @property
    def title(self) -> str:
        return self.get("title", TITLE)

    @property
    def label(self) -> str:
        return self.get("label", LABEL)

    @property
    def field(self) -> str:
        return self.get("field", FIELD)

    @property
    def levels(self) -> List[str]:
        return self.get("levels", LEVELS)

    @property
    def default_level(self) -> str:
        return self.get("defaultLevel", DEFAULTLEVEL)

    @property
    def entity(self) -> List[Dict[str, Any]]:
        return [
            {
                "type": "singleSelect",
                "label": self.label,
                "options": {
                    "disableSearch": True,
                    "autoCompleteFields": [
                        {"value": lvl, "label": lvl} for lvl in self.levels
                    ],
                },
                "defaultValue": self.default_level,
                "field": self.field,
            }
        ]

    def render(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "title": self.title,
            "entity": self.entity,
        }

    @classmethod
    def from_definition(cls, definition: Dict[str, Any]) -> Optional["Tab"]:
        """
        This function checks if the definition either has type==loggingTab, or if it is a normal tab (which later will
        be converted), that satisfies the following conditions:
        1. This dictionary has only 3 keys: name, title and entity (e.g. no keys like warnings)
        2. It has only one entity
        3. The entity is singleSelect and has the predefined log levels.

        Note: Although it is possible to set custom levels, this function will omit other levels, as it would be harder
        to determine whether the tab is indeed a logging tab.
        """
        if definition.get("type") == "loggingTab":
            return LoggingTab(definition)

        if definition.keys() != {"name", "title", "entity"}:
            return None

        if len(definition["entity"]) != 1:
            return None

        entity = definition["entity"][0]

        if entity["type"] != "singleSelect":
            return None

        if entity["options"] != {
            "disableSearch": True,
            "autoCompleteFields": [
                {"value": "DEBUG", "label": "DEBUG"},
                {"value": "INFO", "label": "INFO"},
                {"value": "WARNING", "label": "WARNING"},
                {"value": "ERROR", "label": "ERROR"},
                {"value": "CRITICAL", "label": "CRITICAL"},
            ],
        }:
            return None

        new_definition = {"type": "loggingTab"}

        for key, value, default in {
            ("name", definition["name"], NAME),
            ("title", definition["title"], TITLE),
            ("label", entity["label"], LABEL),
            ("field", entity["field"], FIELD),
            ("defaultLevel", entity["defaultValue"], DEFAULTLEVEL),
        }:
            if value != default:
                new_definition[key] = value

        return LoggingTab(new_definition)
