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
from typing import Optional, Dict, Any

from splunk_add_on_ucc_framework.entity.entity import Entity


class IndexEntity(Entity):
    def long_form(self) -> Dict[str, Any]:
        definition = {
            "type": "singleSelect",
            "field": self["field"],
            "label": self["label"],
            "defaultValue": "default",
            "options": {
                "endpointUrl": "data/indexes?search=isInternal=0+disabled=0",
                "denyList": "^_.*$",
                "createSearchChoice": True,
            },
            "validators": [
                {
                    "type": "regex",
                    "errorMsg": "Index names must begin with a letter or a number "
                    "and must contain only letters, numbers, underscores or hyphens.",
                    "pattern": r"^[a-zA-Z0-9][a-zA-Z0-9\\_\\-]*$",
                },
                {
                    "type": "string",
                    "errorMsg": "Length of index name should be between 1 and 80.",
                    "minLength": 1,
                    "maxLength": 80,
                },
            ],
        }

        for name in ("help", "required", "defaultValue"):
            if name in self:
                definition[name] = self[name]

        return definition

    @classmethod
    def from_definition(cls, definition: Dict[str, Any]) -> Optional[Entity]:
        if definition.get("type") == "index":
            return cls(definition)

        return None
