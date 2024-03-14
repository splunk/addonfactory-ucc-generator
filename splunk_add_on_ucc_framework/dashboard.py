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
import logging
import os
import sys
from defusedxml import ElementTree
from typing import Sequence, List

from splunk_add_on_ucc_framework import global_config as global_config_lib
from splunk_add_on_ucc_framework import utils

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
| timechart sum(n_events) by sourcetype_ingested</query>
          <earliest>$log_time.earliest$</earliest>
          <latest>$log_time.latest$</latest>
        </search>
        <option name="charting.chart">column</option>
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

data_ingestion = ('index=_internal source="/opt/splunk/var/log/splunk/license_usage.log" type=Usage '
                  '(s IN ({input_names})) | timechart span=1d sum(b) as Usage | '
                  'eval Usage=round(Usage/1024/1024/1024,3)')
errors_chart = 'index=_internal source=*{addon_name}* ERROR | timechart span=1d count as Errors'
events_count = ('index=_internal source=*{addon_name}* action=events_ingested | '
                'timechart sum(n_events) as "Events count"')
table_query = ('index=_internal source="/opt/splunk/var/log/splunk/license_usage.log" type=Usage '
               '(s IN ({input_names})) | chart count sparkline(count, 1h) as trend by s | table s count trend')
table1_query = ('index=_internal source=*license_usage.log type=Usage (s IN ({input_names})) | '
                'stats sparkline(sum(b)) count(b), sum(b) as Bytes by st |eval MB=round(Bytes/1024/1024,3)| '
                'eval events=sum(b) | table st, MB, count(b), sparkline(sum(b)) | '
                'rename st as "Source type", MB as "Data volume", count(b) as "Number of events", '
                'sparkline(sum(b)) as "Data volume trend line"')
table2_query = ('index=_internal source=*license_usage.log type=Usage (s IN ({input_names})) | '
                'stats sparkline(sum(b)) count(b), sum(b) as Bytes by s |eval MB=round(Bytes/1024/1024,3)| '
                'eval events=sum(b) | table s, MB, count(b), sparkline(sum(b)) | '
                'rename s as Source, MB as "Data volume", count(b) as "Number of events", '
                'sparkline(sum(b)) as "Data volume trend line"')


q2 = "index=_internal source=*{addon_name}* action=events_ingested | timechart sum(n_events) by sourcetype_ingested"
q3 = "index=_internal source=*{addon_name}* ERROR"


def generate_dashboard_content(
    addon_name: str,
    input_names: List[str],
    custom_components: str,
) -> str:

    input_names_str = ",".join([name + "*" for name in input_names])
    content = (
        utils.get_j2_env()
        .get_template("monitoring_dashboard_template.xml")
        .render(
            addon_name=addon_name,
            data_ingestion=data_ingestion.format(input_names=input_names_str),
            errors_chart=errors_chart.format(addon_name=addon_name.lower()),
            events_count=events_count.format(addon_name=addon_name.lower()),
            table1=table1_query.format(input_names=input_names_str),
            table2=table2_query.format(input_names=input_names_str),
            q2=q2.format(addon_name=addon_name.lower()),
            q3=q3.format(addon_name=addon_name.lower()),
        )
    )

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
            dashboard_components_path = os.path.abspath(
                os.path.join(
                    global_config.original_path,
                    os.pardir,
                    "dashboard_components.xml",
                )
            )
            custom_components = get_custom_xml_content(dashboard_components_path)

        input_names = [el.get("name") for el in global_config.inputs]

        content = generate_dashboard_content(addon_name, input_names, custom_components)
        with open(dashboard_xml_file_path, "w") as dashboard_xml_file:
            dashboard_xml_file.write(content)


def get_custom_xml_content(xml_path: str) -> str:
    custom_xml = load_custom_xml(xml_path)
    root = custom_xml.getroot()
    if root.tag != "custom-dashboard":
        logger.error(
            f"File {xml_path} has invalid root tag '{root.tag}'. "
            f"Valid root tag is 'custom-dashboard'"
        )
        sys.exit(1)

    custom_components = ""
    for it, child in enumerate(root, 1):
        if child.tag == "row":
            custom_components += ElementTree.tostring(child).decode()
        else:
            logger.error(
                f"In file {xml_path}, there should only be tags 'row' under the root tag. "
                f"Child tag no.{it} has invalid name '{child.tag}'."
            )
            sys.exit(1)

    if not custom_components:
        logger.error(
            f"Custom dashboard page set in globalConfig.json but custom content not found. "
            f"Please verify if file {xml_path} has a proper structure "
            f"(see https://splunk.github.io/addonfactory-ucc-generator/dashboard/)"
        )
        sys.exit(1)
    return custom_components


def load_custom_xml(xml_path: str) -> ElementTree:
    try:
        custom_xml = ElementTree.parse(xml_path)
    except FileNotFoundError:
        logger.error(
            f"Custom dashboard page set in globalConfig.json but "
            f"file {xml_path} not found"
        )
        sys.exit(1)
    except ElementTree.ParseError:
        logger.error(f"{xml_path} it's not a valid xml file")
        sys.exit(1)
    return custom_xml
