#
# Copyright 2025 Splunk Inc.
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
from typing import Optional, Dict, Any

from splunk_add_on_ucc_framework.entity.entity import Entity

CRON_REGEX = (
    r"^("
    r"(?:-1|\d+(?:\.\d+)?)"  # Non-negative number or -1
    r"|"
    r"(([\*\d{1,2}\,\-\/]+\s){4}[\*\d{1,2}\,\-\/]+)"  # CRON interval
    r")$"
)


class IntervalEntity(Entity):
    def short_form(self) -> Dict[str, Any]:
        return dict(self)

    def long_form(self) -> Dict[str, Any]:
        definition = {
            "type": "text",
            "field": self["field"],
            "label": self["label"],
            "validators": [
                {
                    "type": "regex",
                    "errorMsg": f"{self['label']} must be either a non-negative number, CRON interval or -1.",
                    "pattern": CRON_REGEX,
                }
            ],
        }

        options = self.get("options", {})
        range_v = options.get("range")

        if range_v is not None:
            min_v, max_v = range_v
            definition["validators"].append(
                {
                    "type": "number",
                    "range": range_v,
                    "errorMsg": f"{self['label']} must be between {min_v} and {max_v}",
                }
            )

        for name in ("help", "required", "defaultValue", "tooltip"):
            if name in self:
                definition[name] = self[name]

        return definition

    @classmethod
    def from_definition(cls, definition: Dict[str, Any]) -> Optional[Entity]:
        if definition.get("type") == "interval":
            return cls(definition)

        if definition.get("type") != "text":
            return None

        if str(definition["field"]).lower() != "interval":
            return None

        validators = {i["type"] for i in list(definition.get("validators", []))}

        if validators != {"regex"} and validators != {"regex", "number"}:
            return None

        new_definition = {
            "type": "interval",
            "field": definition["field"],
            "label": definition["label"],
        }

        for name in ("help", "required", "defaultValue", "tooltip"):
            if name in definition:
                new_definition[name] = definition[name]

        if "number" in validators:
            for v in list(definition["validators"]):
                if v["type"] == "number":
                    new_definition["options"] = {"range": v["range"]}

        return cls(new_definition)
