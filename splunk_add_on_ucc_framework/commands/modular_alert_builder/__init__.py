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
import shutil

from splunk_add_on_ucc_framework.commands.modular_alert_builder.alert_actions_conf_gen import (
    generate_alert_actions_conf,
)
from splunk_add_on_ucc_framework.commands.modular_alert_builder.alert_actions_html_gen import (
    generate_alert_actions_html_files,
)
from splunk_add_on_ucc_framework.commands.modular_alert_builder.alert_actions_py_gen import (
    generate_alert_actions_py_files,
)

logger = logging.getLogger("ucc_gen")


def _copy_alert_icon_to_output(
    internal_root_dir: str,
    output_directory: str,
    addon_name: str,
):
    shutil.copy(
        os.path.join(internal_root_dir, "static", "alerticon.png"),
        os.path.join(output_directory, addon_name, "appserver", "static"),
    )


def generate_alerts(internal_source_dir: str, output_dir: str, envs):
    output_content = {}
    global_settings = envs["global_settings"]

    _copy_alert_icon_to_output(internal_source_dir, output_dir, envs["product_id"])
    package_dir = os.path.join(output_dir, envs["product_id"])

    conf_return = generate_alert_actions_conf(
        input_setting=envs["schema.content"],
        package_path=package_dir,
    )

    html_return = generate_alert_actions_html_files(
        input_setting=envs["schema.content"],
        package_path=package_dir,
    )

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

    return output_content
