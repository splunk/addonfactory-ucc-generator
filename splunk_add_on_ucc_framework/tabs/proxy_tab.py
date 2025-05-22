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

import logging
import sys
from typing import Dict, Any, Optional
from splunk_add_on_ucc_framework.tabs.tab import Tab


logger = logging.getLogger("ucc_gen")

# defaults
NAME = "proxy"
TITLE = "Proxy"

DEFAULT_PROXY_ENABLE = {"type": "checkbox", "label": "Enable", "field": "proxy_enabled"}

DEFAULT_PROXY_TYPE = {
    "type": "singleSelect",
    "label": "Proxy Type",
    "required": False,
    "options": {
        "disableSearch": True,
        "autoCompleteFields": [
            {"value": "http", "label": "http"},
            {"value": "socks4", "label": "socks4"},
            {"value": "socks5", "label": "socks5"},
        ],
    },
    "defaultValue": "http",
    "field": "proxy_type",
}

DEFAULT_HOST = {
    "type": "text",
    "label": "Host",
    "validators": [
        {
            "type": "string",
            "errorMsg": "Max host length is 4096",
            "minLength": 1,
            "maxLength": 4096,
        },
        {
            "type": "regex",
            "errorMsg": "Proxy Host should not have special characters",
            "pattern": "^[a-zA-Z]\\w*$",
        },
    ],
    "field": "proxy_url",
    "required": True,
}

DEFAULT_PORT = {
    "type": "text",
    "label": "Port",
    "validators": [{"type": "number", "range": [1, 65535], "isInteger": True}],
    "field": "proxy_port",
    "required": True,
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
    "label": "DNS resolution",
    "field": "proxy_rdns",
}


class ProxyTab(Tab):
    @property
    def tab_type(self) -> Optional[str]:
        return "proxyTab"

    @classmethod
    def from_definition(cls, definition: Dict[str, Any]) -> Optional["Tab"]:
        """
        This function checks if the definition has type == ProxyTab; if it does, it gets converted;
        otherwise, it returns None.
        """
        if definition.get("type") == "proxyTab":
            entity = []
            entity_key_const_dict: Dict[str, Dict[str, Any]] = {
                "enable_proxy": DEFAULT_PROXY_ENABLE,
                "proxy_type": DEFAULT_PROXY_TYPE,
                "host": DEFAULT_HOST,
                "port": DEFAULT_PORT,
                "username": DEFAULT_USERNAME,
                "password": DEFAULT_PASSWORD,
                "dns_resolution": DEFAULT_DNS_RESOLUTION,
            }

            if ("username" not in definition) ^ ("password" not in definition):
                logger.error("Either of username or password is not mentioned.")
                sys.exit(1)

            elif definition.get("username") != definition.get("password"):
                if (
                    isinstance(definition.get("username"), dict)
                    and definition.get("password") is False
                ):
                    logger.error(
                        "You have updated the username but set the password to 'false' which is not allowed "
                        "set `password = True` for default configuration."
                    )
                    sys.exit(1)
                elif (
                    isinstance(definition.get("password"), dict)
                    and definition.get("username") is False
                ):
                    logger.error(
                        "You have updated the password but set username to `false` which is not allowed "
                        "set `username = True` for default configuration."
                    )
                    sys.exit(1)
                elif (
                    type(definition.get("username")) is bool
                    and type(definition.get("password")) is bool
                ):
                    logger.error(
                        f"You have set different values for username ({definition.get('username')})"
                        f" and password ({definition.get('password')}). They should be same."
                    )
                    sys.exit(1)
            for key_name, value in entity_key_const_dict.items():
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
                    for key, i_value in value.items():
                        if key not in definition.get(key_name, {}):
                            definition[key_name][key] = i_value
                    entity.append(definition[key_name])
                else:
                    entity.append(value)

            new_definition = {
                "name": definition.get("name", NAME),
                "title": definition.get("title", TITLE),
                "entity": entity,
            }

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

            return ProxyTab(new_definition)

        return None
