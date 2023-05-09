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

logger = logging.getLogger("ucc_gen")


def generate_dashboard(content: str, dashboard_xml_file_path: str):
    if os.path.exists(dashboard_xml_file_path):
        logger.warning(
            f"dashboard.xml file already exists @ "
            f"{dashboard_xml_file_path}, not overwriting the existing dashboard file."
        )
    else:
        with open(dashboard_xml_file_path, "w") as dashboard_xml_file:
            dashboard_xml_file.write(content)
