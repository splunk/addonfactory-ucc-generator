#
# Copyright 2023 Splunk Inc.
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
import sys
from typing import Sequence

from splunk_add_on_ucc_framework import global_config as global_config_lib

logger = logging.getLogger("ucc_gen")

PANEL_ADDON_VERSION = "addon_version"
PANEL_EVENTS_INGESTED_BY_SOURCETYPE = "events_ingested_by_sourcetype"
PANEL_ERRORS_IN_THE_ADDON = "errors_in_the_addon"
PANEL_CUSTOM = "custom"

SUPPORTED_PANEL_NAMES = frozenset(
    [
        PANEL_ADDON_VERSION,
        PANEL_EVENTS_INGESTED_BY_SOURCETYPE,
        PANEL_ERRORS_IN_THE_ADDON,
        PANEL_CUSTOM,
    ]
)
SUPPORTED_PANEL_NAMES_READABLE = ", ".join(SUPPORTED_PANEL_NAMES)

DASHBOARD_START = """<form version="1.1">
  <label>Monitoring Dashboard</label>
  <fieldset submitButton="false">
    <input type="time" token="log_time">
      <label>Time for logs</label>
      <default>
        <earliest>-4h@m</earliest>
        <latest>now</latest>
      </default>
    </input>
  </fieldset>
"""
DASHBOARD_END = """</form>"""

PANEL_ADDON_VERSION_TEMPLATE = """  <row>
    <panel>
      <title>Add-on version</title>
      <single>
        <search>
          <query>| rest services/apps/local/{addon_name} splunk_server=local | fields version</query>
          <earliest>-15m</earliest>
          <latest>now</latest>
        </search>
        <option name="drilldown">none</option>
        <option name="rangeColors">["0x53a051","0x0877a6","0xf8be34","0xf1813f","0xdc4e41"]</option>
        <option name="refresh.display">progressbar</option>
        <option name="useThousandSeparators">0</option>
      </single>
    </panel>
  </row>
"""
PANEL_EVENTS_INGESTED_BY_SOURCETYPE_TEMPLATE = """  <row>
    <panel>
      <title>Events ingested by sourcetype</title>
      <chart>
        <search>
          <query>index=_internal source=*{addon_name}* action=events_ingested
| timechart avg(n_events) by sourcetype_ingested</query>
          <earliest>$log_time.earliest$</earliest>
          <latest>$log_time.latest$</latest>
        </search>
        <option name="charting.chart">line</option>
        <option name="charting.drilldown">none</option>
      </chart>
    </panel>
  </row>
"""
PANEL_ERRORS_IN_THE_ADDON_TEMPLATE = """  <row>
    <panel>
      <title>Errors in the add-on</title>
      <event>
        <search>
          <query>index=_internal source=*{addon_name}* ERROR</query>
          <earliest>$log_time.earliest$</earliest>
          <latest>$log_time.latest$</latest>
        </search>
        <option name="list.drilldown">none</option>
        <option name="maxLines">10</option>
        <option name="raw.drilldown">none</option>
        <option name="refresh.display">progressbar</option>
        <option name="rowNumbers">0</option>
        <option name="type">list</option>
      </event>
    </panel>
  </row>
"""


def generate_dashboard_content(
    addon_name: str, panel_names: Sequence[str], custom_components: str
) -> str:
    content = DASHBOARD_START
    for panel_name in panel_names:
        logger.info(f"Including {panel_name} into the dashboard page")
        if panel_name == PANEL_ADDON_VERSION:
            content += PANEL_ADDON_VERSION_TEMPLATE.format(addon_name=addon_name)
        elif panel_name == PANEL_EVENTS_INGESTED_BY_SOURCETYPE:
            content += PANEL_EVENTS_INGESTED_BY_SOURCETYPE_TEMPLATE.format(
                addon_name=addon_name.lower()
            )
        elif panel_name == PANEL_ERRORS_IN_THE_ADDON:
            content += PANEL_ERRORS_IN_THE_ADDON_TEMPLATE.format(
                addon_name=addon_name.lower()
            )
        elif panel_name == PANEL_CUSTOM:
            content += custom_components
        else:
            raise AssertionError("Should not be the case!")
    content += DASHBOARD_END
    return content


def generate_dashboard(
    global_config: global_config_lib.GlobalConfig,
    addon_name: str,
    dashboard_xml_file_path: str,
) -> None:
    if os.path.exists(dashboard_xml_file_path):
        logger.warning(
            f"dashboard.xml file already exists @ "
            f"{dashboard_xml_file_path}, not overwriting the existing dashboard file."
        )
    else:
        panels = global_config.dashboard.get("panels", [])
        panel_names = [panel["name"] for panel in panels]
        custom_components = ""
        if PANEL_CUSTOM in panel_names:
            try:
                dashboard_components_path = os.path.abspath(
                    os.path.join(
                        global_config.original_path,
                        os.pardir,
                        "dashboard_components.txt",
                    )
                )
                with open(dashboard_components_path) as file:
                    custom_components = "".join(file.readlines())
            except FileNotFoundError:
                sys.exit(
                    "custom dashboard page set but dashboard_components.txt file not found"
                )
            if not custom_components:
                sys.exit(
                    "custom dashboard page set but dashboard_components.txt file is empty"
                )
        content = generate_dashboard_content(addon_name, panel_names, custom_components)
        with open(dashboard_xml_file_path, "w") as dashboard_xml_file:
            dashboard_xml_file.write(content)
