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

# type: ignore

import logging
import sys
from typing import Dict, Any, Optional
from splunk_add_on_ucc_framework.tabs.tab import Tab


logger = logging.getLogger("ucc_gen")

# defaults
NAME = "proxy"
TITLE = "Proxy"
ENTITY_KEYS_REQUIRED = {"type", "label", "options", "field"}
ENTITY_KEYS_OPTIONAL = {"help", "defaultValue", "required"}

DEFAULT_PROXY_ENABLE = {"type": "checkbox", "label": "Enable", "field": "proxy_enabled"}

# in singleselect required is type,lable,options and field
DEFAULT_PROXY_TYPE = {
    "type": "singleSelect",
    "label": "Proxy Type",
    "required": True,
    "options": {
        "disableSearch": True,
        "autoCompleteFields": [
            {"value": "http", "label": "http"},
            {"value": "https", "label": "https"},
            {"value": "socks4", "label": "socks4"},
            {"value": "socks5", "label": "socks5"},
        ],
    },
    "defaultValue": "http",
    "field": "proxy_type",
}

# in txt attribute required attribute are field, label and type and we will provide dafault validator
DEFAULT_HOST = {
    "type": "text",
    "label": "Host",
    "required": True,
    "validators": [
        {
            "type": "string",
            "errorMsg": "Max host length is 4096",
            "minLength": 0,
            "maxLength": 4096,
        },
        {
            "type": "regex",
            "errorMsg": "Proxy Host should not have special characters",
            "pattern": "^[a-zA-Z]\\w*$",
        },
    ],
    "field": "proxy_url",
}

DEFAULT_PORT = {
    "type": "text",
    "label": "Port",
    "required": True,
    "validators": [{"type": "number", "range": [1, 65535], "isInteger": True}],
    "field": "proxy_port",
}

DEFAULT_USERNAME = {
    "type": "text",
    "label": "Username",
    "validators": [
        {
            "type": "string",
            "errorMsg": "Max length of username is 50",
            "minLength": 0,
            "maxLength": 50,
        }
    ],
    "field": "proxy_username",
}

DEFAULT_PASSWORD = {
    "type": "text",
    "label": "Password",
    "validators": [
        {
            "type": "string",
            "errorMsg": "Max length of password is 8192",
            "minLength": 0,
            "maxLength": 8192,
        }
    ],
    "encrypted": True,
    "field": "proxy_password",
}

DEFAULT_DNS_RESOLUTION = {
    "type": "checkbox",
    "label": "Reverse DNS resolution",
    "field": "proxy_rdns",
}


class ProxyTab(Tab):
    @property
    def tab_type(self) -> Optional[str]:
        return "ProxyTab"

    # def short_form(self) -> Dict[str, Any]:
    #     entity = self["entity"][0]
    #     levels = [i["value"] for i in entity["options"]["autoCompleteFields"]]
    #     new_definition = {"type": "ProxyTab"}

    #     for key, value, default in [
    #         ("name", self["name"], NAME),
    #         ("title", self["title"], TITLE),
    #         ("label", entity["label"], LABEL),
    #         ("field", entity["field"], FIELD),
    #         ("levels", levels, LEVELS),
    #         ("defaultLevel", entity.get("defaultValue", DEFAULTLEVEL), DEFAULTLEVEL),
    #     ]:
    #         if value != default:
    #             new_definition[key] = value

    #     if "help" in entity:
    #         new_definition["help"] = entity["help"]

    #     return new_definition

    @classmethod
    def from_definition(cls, definition: Dict[str, Any]) -> Optional["Tab"]:
        """
        This function checks if the definition either has type==ProxyTab, or if it is a normal tab (which later will
        be converted), that satisfies the following conditions:
        1. This dictionary has only 3 keys: name, title and entity (e.g. no keys like warnings)
        2. It has only one entity
        3. The entity is singleSelect and has the predefined log levels.

        Note: Although it is possible to set custom levels, this function will omit other levels, as it would be harder
        to determine whether the tab is indeed a logging tab.
        """
        if definition.get("type") == "proxyTab":
            entity = []
            entity_key_const_dict = {
                "enable_proxy": DEFAULT_PROXY_ENABLE,
                "proxy_type": DEFAULT_PROXY_TYPE,
                "port": DEFAULT_PORT,
                "host": DEFAULT_HOST,
                "username": DEFAULT_USERNAME,
                "password": DEFAULT_PASSWORD,
                "dns_resolution": DEFAULT_DNS_RESOLUTION,
            }

            def updating_dictionaries(key_name, const):
                for key, value in const.items():
                    print("\n key and value in const are", key, value)
                    if key not in definition.get(key_name):
                        definition.get(key_name)[key] = value
                entity.append(definition.get(key_name))

            # TODO: update check when false and null are used
            if definition.get("username") != definition.get("password"):
                logger.error("you had set conflicting value for username and password")
                sys.exit(1)
            for key_name, value in entity_key_const_dict.items():
                print(
                    "\n definition with key_name:", key_name, definition.get(key_name)
                )

                if definition.get(key_name) is True:
                    entity.append(value)
                elif (not definition.get(key_name)) and key_name in [
                    "proxy_type",
                    "username",
                    "password",
                    "dns_resolution",
                ]:
                    continue
                elif definition.get(key_name):
                    updating_dictionaries(key_name, value)
                else:
                    entity.append(value)

            new_definition = {
                "name": definition.get("name", NAME),
                "title": definition.get("title", TITLE),
                "entity": entity,
            }

            # Now new_difinition has all the required attribute,now update the new_definition with customization
            # set by user
            for key, value in definition.items():
                if key not in [
                    "name",
                    "title",
                    "enable_proxy",
                    "proxy_type",
                    "port",
                    "host",
                    "username",
                    "password",
                    "dns_resolution",
                    "type",
                ]:
                    new_definition[key] = value

            # if "help" in definition:
            #     entity["help"] = definition["help"]

            print("\n\n new_defination that is being", new_definition)

            return ProxyTab(new_definition)

        if "type" in definition:
            return None

        # if definition.keys() != {"name", "title", "entity"}:
        #     return None

        # if len(definition["entity"]) != 1:
        #     return None

        # entities = definition["entity"]

        # for dict in entities:
        #     if dict["type"] == "singleSelect":
        #         if not all(key in dict.keys() for key in ENTITY_KEYS_REQUIRED):
        #             return None

        # entity = definition["entity"][0]

        # if not all(key in entity.keys() for key in ENTITY_KEYS_REQUIRED):
        #     return None

        # if entity.keys() - ENTITY_KEYS_REQUIRED - ENTITY_KEYS_OPTIONAL:
        #     return None

        # if entity["type"] != "singleSelect":
        #     return None

        # if entity["options"].keys() != {
        #     "disableSearch",
        #     "autoCompleteFields",
        # } and entity["options"].keys() != {"autoCompleteFields"}:
        #     return None

        # levels = []

        # for field in entity["options"]["autoCompleteFields"]:
        #     if "value" not in field:
        #         return None

        #     level = field["value"]

        #     if level not in AVAILABLE_LEVELS:
        #         return None

        #     levels.append(level)

        # entity["required"] = True
        # entity["options"]["disableSearch"] = True
