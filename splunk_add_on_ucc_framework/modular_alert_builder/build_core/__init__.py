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
import re
import shutil

from splunk_add_on_ucc_framework.modular_alert_builder.build_core.alert_actions_conf_gen import (
    generate_alert_actions_conf,
)
from splunk_add_on_ucc_framework.modular_alert_builder.build_core.alert_actions_html_gen import (
    generate_alert_actions_html_files,
)
from splunk_add_on_ucc_framework.modular_alert_builder.build_core.alert_actions_py_gen import (
    generate_alert_actions_py_files,
)

logger = logging.getLogger("ucc_gen")

cache_path = {}  # type: ignore


def check_file_name(file_name, env):
    # file_name is string, read from setting file
    # this function replaces all ${short_name} and other to its real value
    if file_name in cache_path:
        return cache_path[file_name]

    search = re.findall(r"\${\!?([\w\-\.]+)}", file_name, re.MULTILINE)
    if not search:
        cache_path[file_name] = file_name
        return file_name

    new_str = file_name
    for gp in search:
        if gp in env:
            new_str = new_str.replace("${%s}" % gp, env[gp], re.MULTILINE)
            new_str = new_str.replace(
                "${!%s}" % gp, re.sub(r"[^\w]+", "_", env[gp].lower()), re.MULTILINE
            )

    # Disable the cache to avoid conflict
    # cache_path[file_name] = new_str
    return new_str


def check_file_list(dirName, file_list, env):
    ret = []
    for dname in file_list:
        new_dname = check_file_name(dname, env)
        if new_dname != dname:
            ret.append((check_file_name(dirName, env), dname, new_dname))

    return ret


def prepare_ta_directory_tree(src, dest, envs):
    """
    If dest doesn't exist, then generate a new TA directory tree.
    If dest exists, then merge with the new one
    """
    output_dir = dest

    if not output_dir:
        # if not output, then all content will be print to screen
        logger.info('event="No output_dir", will print content to screen"')
        return output_dir

    if os.path.exists(output_dir):
        logger.info('event="output_dir=%s already exist"', output_dir)
        output_dir = os.path.join(output_dir, envs["product_id"] + "_temp_output")
        logger.info('event="generate a new output_dir=%s"', output_dir)
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)

    try:
        # copy file
        logger.info('event="Copying directory tree: src=%s dest=%s"', src, output_dir)
        shutil.copytree(src, output_dir)

        # process each file's name
        logger.info(
            'event="Replace each file name\'s placeholder under dir=%s"', output_dir
        )
        move_list = []
        for dirName, subdirList, fileList in os.walk(output_dir):
            move_list.extend(check_file_list(dirName, subdirList, envs))
            move_list.extend(check_file_list(dirName, fileList, envs))

        for x, y, z in move_list:
            shutil.move(os.path.sep.join([x, y]), os.path.sep.join([x, z]))

    except Exception as e:
        if output_dir != dest and os.path.exists(output_dir):
            logger.info('clean temp_output_dir="%s"', output_dir)
            shutil.rmtree(output_dir)
        raise e
    return output_dir


def generate_alerts(src, dest, envs):
    output_dir = dest
    package_dir = None
    output_content = {}
    conf_return = None
    html_return = None
    py_return = None
    global_settings = envs["global_settings"]

    try:
        if dest:
            output_dir = prepare_ta_directory_tree(src, dest, envs)
            package_dir = os.path.join(dest, envs["product_id"])

        build_components = envs["build_components"]
        if build_components["conf"]:
            conf_return = generate_alert_actions_conf(
                input_setting=envs["schema.content"],
                package_path=package_dir,
                global_settings=global_settings,
            )

        if build_components["html"]:
            html_return = generate_alert_actions_html_files(
                input_setting=envs["schema.content"],
                package_path=package_dir,
                html_setting=envs["html_setting"],
            )

        if build_components["py"]:
            py_return = generate_alert_actions_py_files(
                input_setting=envs["schema.content"],
                package_path=package_dir,
                global_settings=global_settings,
            )

        if conf_return:
            output_content["conf"] = conf_return
        if html_return:
            output_content["html"] = conf_return
        if py_return:
            output_content["py"] = py_return

        if output_dir != dest:
            """
            Which means the previous output_dir already there
            """
            from . import alert_actions_merge

            alert_actions_merge.merge(
                os.path.join(output_dir, envs["product_id"]),
                os.path.join(dest, envs["product_id"]),
            )
            logger.info('event="merged %s to %s', output_dir, dest)
    finally:
        if output_dir != dest and os.path.exists(output_dir):
            logger.info('clean temp_output_dir="%s"', output_dir)
            shutil.rmtree(output_dir)

    return output_content
