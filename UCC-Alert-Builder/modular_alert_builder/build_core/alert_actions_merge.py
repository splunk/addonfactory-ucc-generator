import os
import os.path as op
from os.path import dirname as dn
from os.path import basename as bn
from shutil import copy
import alert_actions_exceptions as aae
import arf_consts as ac

from alert_utils.alert_utils_common.conf_parser import TABConfigParser

merge_black_list = ['default.meta', 'README.txt']
merge_mode_config = {
    "app.conf": "item_overwrite"
}


def remove_alert_from_conf_file(alert, conf_file, logger):
    if not alert or not conf_file:
        logger.info('alert="%s", conf_file="%s"', alert, conf_file)
        return

    if not isinstance(alert, dict):
        msg = 'alert="{}", event="alert is not a dict, don\'t remove anything form file {}"'.format(alert, conf_file)
        raise aae.AlertCleaningFormatFailure(msg)

    parser = TABConfigParser()
    parser.read(conf_file)
    conf_dict = parser.item_dict()

    for stanza, key_values in conf_dict.items():
        if stanza == alert[ac.SHORT_NAME] or \
            stanza == alert[ac.SHORT_NAME] + "_modaction_result" or \
                stanza == "eventtype=" + alert[ac.SHORT_NAME] + "_modaction_result":
            logger.info('alert="%s", conf_file="%s", stanza="%s"',
                        alert[ac.SHORT_NAME],
                        conf_file, stanza)
            parser.remove_section(stanza)

    with open(conf_file, "w") as cf:
        parser.write(cf)


def merge_conf_file(src_file, dst_file, merge_mode="stanza_overwrite"):
    if not os.path.isfile(src_file):
        return
    if not os.path.isfile(dst_file):
        return
    if bn(src_file) in merge_black_list:
        return

    parser = TABConfigParser()
    parser.read(src_file)
    src_dict = parser.item_dict()
    parser.read(dst_file)
    dst_dict = parser.item_dict()

    if merge_mode == "stanza_overwrite":
        for stanza, key_values in src_dict.items():
            if stanza not in dst_dict:
                parser.add_section(stanza)
            else:
                parser.remove_section(stanza)
                parser.add_section(stanza)

            for k, v in key_values.items():
                parser.set(stanza, k, v)
    elif merge_mode == "item_overwrite":
        for stanza, key_values in src_dict.items():
            if stanza not in dst_dict:
                parser.add_section(stanza)

            for k, v in key_values.items():
                if v:
                    parser.set(stanza, k, v)
                else:
                    parser.remove_option(stanza, k)
    else:
        # overwrit the whole file
        parser.read(src_file)

    with open(dst_file, "w") as df:
        parser.write(df)


def merge(src, dst, no_black_list=True):
    if op.isfile(src):
        return

    src_files = os.listdir(src)
    dst_files = os.listdir(dst)
    merge_mode = "stanza_overwrite"

    for file in src_files:
        f_path = op.join(src, file)
        if op.isfile(f_path):
            if no_black_list and file in merge_black_list:
                continue

            if file.endswith("pyo") or file.endswith("pyc"):
                continue
            if file in dst_files and (file.endswith('.conf') or file.endswith('.conf.spec')):
                if file in merge_mode_config.keys():
                    merge_mode = merge_mode_config[file]
                merge_conf_file(f_path, op.join(dst, file), merge_mode)
            else:
                copy(f_path, dst)
        elif op.isdir(f_path):
            if file.startswith('.'):
                continue
            if file not in dst_files:
                os.makedirs(op.join(dst, file))
            merge(f_path, op.join(dst, file))
        else:
            raise Exception("Unsupported file type {}".format(f_path))
