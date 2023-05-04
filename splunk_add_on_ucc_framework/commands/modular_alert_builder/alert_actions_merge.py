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
import logging
import os
from os.path import basename as bn

import addonfactory_splunk_conf_parser_lib as conf_parser

from splunk_add_on_ucc_framework.commands.modular_alert_builder import (
    alert_actions_exceptions as aae,
)
from splunk_add_on_ucc_framework.commands.modular_alert_builder import (
    arf_consts as ac,
)

merge_deny_list = ["default.meta", "README.txt"]
merge_mode_config = {"app.conf": "item_overwrite"}

logger = logging.getLogger("ucc_gen")


def remove_alert_from_conf_file(alert, conf_file):
    if not alert or not conf_file:
        logger.info('alert="%s", conf_file="%s"', alert, conf_file)
        return

    if not isinstance(alert, dict):
        msg = 'alert="{}", event="alert is not a dict, don\'t remove anything form file {}"'.format(
            alert, conf_file
        )
        raise aae.AlertCleaningFormatFailure(msg)

    parser = conf_parser.TABConfigParser()
    parser.read(conf_file)
    conf_dict = parser.item_dict()

    for stanza, key_values in list(conf_dict.items()):
        if (
            stanza == alert[ac.SHORT_NAME]
            or stanza == alert[ac.SHORT_NAME] + "_modaction_result"
            or stanza == "eventtype=" + alert[ac.SHORT_NAME] + "_modaction_result"
        ):
            logger.info(
                'alert="%s", conf_file="%s", stanza="%s"',
                alert[ac.SHORT_NAME],
                conf_file,
                stanza,
            )
            parser.remove_section(stanza)

    with open(conf_file, "w") as cf:
        parser.write(cf)


def merge_conf_file(src_file, dst_file, merge_mode="stanza_overwrite"):
    if not os.path.isfile(src_file):
        return
    if not os.path.isfile(dst_file):
        return
    if bn(src_file) in merge_deny_list:
        return

    sparser = conf_parser.TABConfigParser()
    sparser.read(src_file)
    src_dict = sparser.item_dict()
    parser = conf_parser.TABConfigParser()
    parser.read(dst_file)
    dst_dict = parser.item_dict()

    if merge_mode == "stanza_overwrite":
        for stanza, key_values in list(src_dict.items()):
            if stanza not in dst_dict:
                parser.add_section(stanza)
            else:
                parser.remove_section(stanza)
                parser.add_section(stanza)

            for k, v in list(key_values.items()):
                parser.set(stanza, k, v)
    elif merge_mode == "item_overwrite":
        for stanza, key_values in list(src_dict.items()):
            if stanza not in dst_dict:
                parser.add_section(stanza)

            for k, v in list(key_values.items()):
                if v:
                    parser.set(stanza, k, v)
                else:
                    parser.remove_option(stanza, k)
    else:
        # overwrite the whole file
        parser.read(src_file)

    with open(dst_file, "w") as df:
        parser.write(df)
