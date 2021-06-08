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


import sys
import os.path as op
from os import rename, remove, makedirs
from .alert_actions_merge import merge_conf_file

from splunk_add_on_ucc_framework.alert_utils.alert_utils_common.conf_parser import TABConfigParser


def write_file(file_name, file_path, content, logger, merge="stanza_overwrite"):
    logger.debug('operation="write", object="%s" object_type="file"',
                 file_path)

    do_merge = False
    if file_name.endswith('.conf') or file_name.endswith('conf.spec'):
        do_merge = True
    else:
        logger.info('event="Will not merge file="%s", ' +
                    'reason="Only support conf file merge"', file_path)

    if file_path:
        new_file = None
        if op.exists(file_path) and do_merge:
            new_file = op.join(op.dirname(file_path), "new_" + file_name)
        if new_file:
            try:
                with open(new_file, 'w+') as fhandler:
                    fhandler.write(content)
                merge_conf_file(new_file, file_path, merge)
            finally:
                if op.exists(new_file):
                    remove(new_file)
        else:
            if not op.exists(op.dirname(file_path)):
                makedirs(op.dirname(file_path))
            with open(file_path, 'w+') as fhandler:
                fhandler.write(content)
            if do_merge:
                # need to process the file with conf parser
                parser = TABConfigParser()
                parser.read(file_path)
                with open(file_path, 'w') as df:
                    parser.write(df)
    else:
        sys.stdout.write("\n##################File {}##################\n".format(file_name))
        sys.stdout.write(content)


GLOBAL_SETTING_TYPE_MAP = {
    "text": "text",
    "checkbox": "bool",
    "password": "password"
}

GLOBAL_SETTING_VALUE_NAME_MAP = {
    "text": "content",
    "bool": "bool",
    "password": "password"
}


def convert_custom_setting(parameters):
    """
    convert
    [{
        "default_value": "message",
        "name": "notification_type",
        "required": true,
        "help_string": "Choose style of HipChat notification.",
        "possible_values": {
             "Application Card": "card",
             "Message": "message"
         },
         "label": "Notification Style",
         "format_type": "dropdownlist",
         "value": "xxxx"
      }]
    to
    [{
    "title": "customized key",
    "name": "customized name",
    "type": "text",
    "description": "description of customized key"
    }]
    """
    formated = []
    if not parameters:
        return formated

    for param in parameters:
        if param.get("format_type") not in list(GLOBAL_SETTING_TYPE_MAP.keys()):
            msg = 'format_type="{}" is not support for global setting'.format(
                param.get("format_type"))
            raise Exception(msg)

        one_param = {
            "title": param.get("label"),
            "name": param.get("name"),
            "type": GLOBAL_SETTING_TYPE_MAP[param.get("format_type")],
            "description": param.get("help_string")
        }
        formated.append(one_param)

    return formated


def convert_global_setting(global_settings):
    """
    convert
    {
    "customized_settings": {
        "string_label": {
        "type": "text",
        "content": "string"
        },
        "password": {
        "type": "password",
        "password": "123"
        },
        "checkbox": {
        "type": "bool",
        "bool": true
        }
    },
    "proxy_settings": {
        "proxy_password": "sef",
        "proxy_type": "http",
        "proxy_url": "1.2.3.4",
    },
    "global_settings": {
        "log_level": "INFO"
    }
  to
    {
    "title": "Proxy",
    "name": "proxy",
    "type": "default_proxy",
    "description": "proxy settings"
    },
    {
    "title": "Account Key Title",
    "name": "username",
    "type": "default_account",
    "description": "The username of the user account"
    },
    {
    "title": "Account Secret Title",
    "name": "password",
    "type": "default_account",
    "description": "The password of the user account"
    },
    {
    "title": "customized key",
    "name": "customized name",
    "type": "text",
    "description": "description of customized key"
    """
    converted = []
    if not global_settings:
        return converted

    for type, settings in list(global_settings.items()):
        if type == "proxy_settings":
            proxy = {
                "title": "Proxy",
                "name": "proxy",
                "type": "default_proxy",
                "description": "proxy settings"}
            converted.append(proxy)
        elif type == "log_settings":
            logging = {
                "title": "Logging",
                "name": "logging",
                "type": "default_logging",
                "description": "logging setting"}
            converted.append(logging)
        elif type == "credential_settings":
            username = {
                "title": "Account Key Title",
                "name": "tab_default_account_username",
                "type": "default_account",
                "description": "The username of the user account"
            }
            password = {
                "title": "Account Secret Title",
                "name": "tab_default_account_password",
                "type": "default_account",
                "description": "The password of the user account"}
            converted.append(username)
            converted.append(password)
        elif type == "customized_settings":
            custom_settings = convert_custom_setting(settings)
            converted += custom_settings
    return converted



def convert_global_setting_previous(global_settings):
    """
    convert global_settings=[
        {
            "type": "proxy"
        },
        {
            "type": "logging"
        },
        {
            "type": "account"
        },
        {
            "type": "custom",
            "parameters": []
        }
    ]
        to [
    {
    "title": "Proxy",
    "name": "proxy",
    "type": "default_proxy",
    "description": "proxy settings"
    },
    {
    "title": "Account Key Title",
    "name": "username",
    "type": "default_account",
    "description": "The username of the user account"
    },
    {
    "title": "Account Secret Title",
    "name": "password",
    "type": "default_account",
    "description": "The password of the user account"
    },
    {
    "title": "customized key",
    "name": "customized name",
    "type": "text",
    "description": "description of customized key"
    }
]
    """
    converted = []
    if not global_settings:
        return converted

    for setting in global_settings:
        if setting.get("type") == "proxy":
            proxy = {
                "title": "Proxy",
                "name": "proxy",
                "type": "default_proxy",
                "description": "proxy settings"}
            converted.append(proxy)
        elif setting.get("type") == "logging":
            logging = {
                "title": "Logging",
                "name": "logging",
                "type": "default_logging",
                "description": "logging setting"}
            converted.append(logging)
        elif setting.get("type") == "account":
            username = {
                "title": "Account Key Title",
                "name": "username",
                "type": "default_account",
                "description": "The username of the user account"
            }
            password = {
                "title": "Account Secret Title",
                "name": "password",
                "type": "default_account",
                "description": "The password of the user account"}
            converted.append(username)
            converted.append(password)
        elif setting.get("type") == "custom":
            custom_settings = convert_custom_setting(setting.get("parameters"))
            converted += custom_settings
    return converted


def get_test_parameter_type(param):
    if not param:
        return None

    if param.get("format_type") in list(GLOBAL_SETTING_TYPE_MAP.keys()):
        return GLOBAL_SETTING_TYPE_MAP.get(param.get("format_type"))
    return None


def get_parameter_type(param, parameters_meta, logger):
    if not parameters_meta:
        logger.info('parameters_meta="None"')
        return None

    if not param:
        logger.info('param="None"')
        return None

    for param_meta in parameters_meta:
        if param == param_meta["name"]:
            return GLOBAL_SETTING_TYPE_MAP.get(param_meta["format_type"])

    return None


def convert_test_global_settings(test_global_settings, logger):
    """
    convert to:
{
  "customized_settings": {
    "string_label": {
      "type": "text",
      "content": "string"
    },
    "password": {
      "type": "password",
      "password": "123"
    },
    "checkbox": {
      "type": "bool",
      "bool": true
    }
  },
  "proxy_settings": {
    "proxy_password": "sef",
    "proxy_type": "http",
    "proxy_url": "1.2.3.4",
    "proxy_rdns": "0",
    "proxy_username": "sdf",
    "proxy_port": "34",
    "proxy_enabled": "1"
  },
  "global_settings": {
    "log_level": "INFO"
  }
}
    """
    if not test_global_settings:
        logger.info('test_global_settings="%s"', test_global_settings)
        return {}

    converted = {}
    for type, settings in list(test_global_settings.items()):
        if type == "customized_settings":
            converted["customized_settings"] = {}
            for setting in settings:
                type = get_test_parameter_type(setting)
                if not type:
                    msg = 'No type for {} in customized_settings'.format(setting)
                    raise NotImplementedError(msg)

                converted["customized_settings"][setting["name"]] = {
                    "type": type,
                    GLOBAL_SETTING_VALUE_NAME_MAP[type]: setting.get("value")
                }
        elif type == "log_settings":
            converted["global_settings"] = settings
        else:
            converted[type] = settings
    return converted


def split_path(path):
    """
    split a path into a list
    """
    if not path:
        return None
    paths = []
    (head, tail) = op.split(path)
    while tail:
        paths.insert(0, tail)
        (head, tail) = op.split(head)
    (drive, rest) = op.splitdrive(head)
    if drive:
        paths.insert(0, drive)
    else:
        paths.insert(0, head)
    return paths
