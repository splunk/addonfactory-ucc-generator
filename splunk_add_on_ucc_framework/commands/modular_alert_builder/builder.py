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
import os

from splunk_add_on_ucc_framework import global_config as global_config_lib
from splunk_add_on_ucc_framework.commands.modular_alert_builder import (
    normalize,
)
from splunk_add_on_ucc_framework.commands.modular_alert_builder import (
    alert_actions_py_gen,
)

logger = logging.getLogger("ucc_gen")


def generate_alerts(
    global_config: global_config_lib.GlobalConfig,
    addon_name: str,
    output_dir: str,
) -> None:
    envs = normalize.normalize(
        global_config.alerts,
        global_config.namespace,
    )
    package_dir = os.path.join(output_dir, addon_name)
    schema_content = envs["schema.content"]

    py_gen = alert_actions_py_gen.AlertActionsPyGenerator(
        addon_name=addon_name,
        input_setting=schema_content,
        package_path=package_dir,
    )
    py_gen.handle()
