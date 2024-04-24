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
from typing import Dict, Any, Optional

from splunk_add_on_ucc_framework.tabs.tab import Tab


# defaults
NAME = "logging"
TITLE = "Logging"
LEVELS = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
FIELD = "loglevel"
LABEL = "Log level"
DEFAULTLEVEL = "INFO"

ENTITY_KEYS_REQUIRED = {"type", "label", "options", "field"}
ENTITY_KEYS_OPTIONAL = {"help", "defaultValue", "required"}


class LoggingTab(Tab):
    @property
    def tab_type(self) -> Optional[str]:
        return "loggingTab"

    def short_form(self) -> Dict[str, Any]:
        entity = self["entity"][0]
        new_definition = {"type": "loggingTab"}

        for key, value, default in {
            ("name", self["name"], NAME),
            ("title", self["title"], TITLE),
            ("label", entity["label"], LABEL),
            ("field", entity["field"], FIELD),
            ("defaultLevel", entity.get("defaultValue", DEFAULTLEVEL), DEFAULTLEVEL),
        }:
            if value != default:
                new_definition[key] = value

        if "help" in entity:
            new_definition["help"] = entity["help"]

        return new_definition

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
            entity = {
                "type": "singleSelect",
                "label": definition.get("label", LABEL),
                "options": {
                    "disableSearch": True,
                    "autoCompleteFields": [
                        {"value": lvl, "label": lvl}
                        for lvl in definition.get("levels", LEVELS)
                    ],
                },
                "defaultValue": definition.get("defaultLevel", DEFAULTLEVEL),
                "field": definition.get("field", FIELD),
            }

            new_definition = {
                "name": definition.get("name", NAME),
                "title": definition.get("title", TITLE),
                "entity": [entity],
            }

            if "help" in definition:
                entity["help"] = definition["help"]

            return LoggingTab(new_definition)

        if definition.keys() != {"name", "title", "entity"}:
            return None

        if len(definition["entity"]) != 1:
            return None

        entity = definition["entity"][0]

        if not all(key in entity.keys() for key in ENTITY_KEYS_REQUIRED):
            return None

        if entity.keys() - ENTITY_KEYS_REQUIRED - ENTITY_KEYS_OPTIONAL:
            return None

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

        # It doesn't make sense to use False here
        entity["required"] = True

        return LoggingTab(definition)
