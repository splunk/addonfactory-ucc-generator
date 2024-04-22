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
import json
import logging
import os
import sys

from typing import Dict, List, Any

from splunk_add_on_ucc_framework import global_config as global_config_lib
from splunk_add_on_ucc_framework import utils

logger = logging.getLogger("ucc_gen")

PANEL_ADDON_VERSION = "addon_version"
PANEL_EVENTS_INGESTED_BY_SOURCETYPE = "events_ingested_by_sourcetype"
PANEL_ERRORS_IN_THE_ADDON = "errors_in_the_addon"
PANEL_DEFAULT = "default"
PANEL_CUSTOM = "custom"

SUPPORTED_PANEL_NAMES = frozenset(
    [
        PANEL_DEFAULT,
        PANEL_CUSTOM,
        PANEL_ADDON_VERSION,
        PANEL_EVENTS_INGESTED_BY_SOURCETYPE,
        PANEL_ERRORS_IN_THE_ADDON,
    ]
)
SUPPORTED_PANEL_NAMES_READABLE = ", ".join(SUPPORTED_PANEL_NAMES)

default_definition_json_filename = {
    "overview": "overview_definition.json",
    "data_ingestion_tab": "data_ingestion_tab_definition.json",
    "errors_tab": "errors_tab_definition.json",
}

data_ingestion = (
    "index=_internal source=*license_usage.log type=Usage "
    "(s IN ({input_names})) | timechart span=1d sum(b) as Usage | "
    'eval Usage=round(Usage/1024/1024/1024,3) | rename Usage as \\"Data volume\\"'
)
data_ingestion_and_events = (
    "index=_internal source=*license_usage.log type=Usage "
    "(s IN ({input_names})) | timechart span=1d sum(b) as Usage "
    '| eval Usage=round(Usage/1024/1024/1024,3) | rename Usage as \\"Data volume\\" '
    "| join _time [search index=_internal source=*{addon_name}* action=events_ingested "
    '| timechart sum(n_events) as \\"Number of events\\" ] '
)
errors_count = (
    "index=_internal source=*{addon_name}* ERROR | timechart span=1d count as Errors"
)
events_count = (
    "index=_internal source=*{addon_name}* action=events_ingested | "
    'timechart sum(n_events) as \\"Number of events\\"'
)

table_sourcetype_query = (
    "index=_internal source=*license_usage.log type=Usage "
    "(s IN ({input_names})) "
    "| stats sparkline(sum(b)), sum(b) as Bytes by st "
    "| join type=left st [search index = _internal source=*{addon_name}* action=events_ingested "
    '| stats latest(_time) AS \\"Last seen\\", sum(n_events) by sourcetype_ingested '
    "| rename sourcetype_ingested as st ]"
    '| convert ctime(\\"Last seen\\") | eval GB=round(Bytes/1024/1024/1024,3) '
    '| table st, GB, sum(n_events), sparkline(sum(b)), \\"Last seen\\" '
    '| rename st as \\"Source type\\", GB as \\"Data volume [GB]\\", '
    'sum(n_events) as \\"Number of events\\", sparkline(sum(b)) as \\"Data volume trend line\\"'
)
table_source_query = (
    "index=_internal source=*license_usage.log type=Usage "
    "(s IN ({input_names})) "
    "| stats sparkline(sum(b)), sum(b) as Bytes by s "
    "| join type=left s [search index = _internal source=*{addon_name}* action=events_ingested "
    '| stats latest(_time) AS \\"Last seen\\", sum(n_events) by modular_input_name '
    "| rename modular_input_name as s ]"
    '| convert ctime(\\"Last seen\\") | eval GB=round(Bytes/1024/1024/1024,3)| eval events=sum(b)'
    '| table s, GB, sum(n_events), sparkline(sum(b)), \\"Last seen\\" '
    '| rename s as \\"Source\\", GB as \\"Data volume [GB]\\", '
    'sum(n_events) as \\"Number of events\\", sparkline(sum(b)) as \\"Data volume trend line\\"'
)
table_host_query = (
    "index=_internal source=*license_usage.log type=Usage "
    "(s IN ({input_names})) "
    "| stats sparkline(sum(b)), sum(b) as Bytes by h "
    "| join type=left h [search index = _internal source=*{addon_name}* action=events_ingested "
    '| stats latest(_time) AS \\"Last seen\\", sum(n_events) by host | rename host as h ]'
    '| convert ctime(\\"Last seen\\") | eval GB=round(Bytes/1024/1024/1024,3)| eval events=sum(b)'
    '| table h, GB, sparkline(sum(b)), \\"Last seen\\" '
    '| rename h as \\"Host\\", GB as \\"Data volume [GB]\\", '
    'sparkline(sum(b)) as \\"Data volume trend line\\"'
)
table_index_query = (
    "index=_internal source=*license_usage.log type=Usage "
    "(s IN ({input_names})) "
    "| stats sparkline(sum(b)), sum(b) as Bytes by idx "
    "| join type=left idx [search index = _internal source=*{addon_name}* action=events_ingested "
    '| stats latest(_time) AS \\"Last seen\\", sum(n_events) by event_index '
    "| rename event_index as idx ]"
    '| convert ctime(\\"Last seen\\") | eval GB=round(Bytes/1024/1024/1024,3)| eval events=sum(b)'
    '| table idx, GB, sum(n_events), sparkline(sum(b)), \\"Last seen\\" '
    '| rename idx as \\"Index\\", GB as \\"Data volume [GB]\\", '
    'sum(n_events) as \\"Number of events\\", sparkline(sum(b)) as \\"Data volume trend line\\"'
)
table_account_query = (
    "index = _internal source=*{addon_name}* action=events_ingested "
    "| stats latest(_time) as ls, sum(n_events) by event_account | convert ctime(ls) "
    "| table event_account, sum(n_events), ls "
    '| rename event_account as \\"Account\\", sum(n_events) as \\"Number of events\\", '
    'ls as \\"Last seen\\"'
)
table_input_query = (
    "index = _internal source=*{addon_name}* action=events_ingested "
    "| stats latest(_time) as ls, sum(n_events) by event_input | convert ctime(ls) "
    "| table event_input, sum(n_events), ls "
    '| rename event_input as \\"Input\\", sum(n_events) as \\"Number of events\\", '
    'ls as \\"Last seen\\"'
)

errors_list_query = "index=_internal source=*{addon_name}* ERROR"


def generate_dashboard_content(
    addon_name: str, input_names: List[str], definition_json_name: str
) -> str:
    input_names_str = ",".join([name + "*" for name in input_names])
    content = ""

    if definition_json_name == default_definition_json_filename["overview"]:
        content = (
            utils.get_j2_env()
            .get_template(definition_json_name)
            .render(
                data_ingestion_and_events=data_ingestion_and_events.format(
                    input_names=input_names_str, addon_name=addon_name.lower()
                ),
                errors_count=errors_count.format(addon_name=addon_name.lower()),
                events_count=events_count.format(addon_name=addon_name.lower()),
            )
        )

    if definition_json_name == default_definition_json_filename["data_ingestion_tab"]:
        content = (
            utils.get_j2_env()
            .get_template(definition_json_name)
            .render(
                data_ingestion=data_ingestion.format(input_names=input_names_str),
                errors_count=errors_count.format(addon_name=addon_name.lower()),
                events_count=events_count.format(addon_name=addon_name.lower()),
                table_sourcetype=table_sourcetype_query.format(
                    input_names=input_names_str, addon_name=addon_name.lower()
                ),
                table_source=table_source_query.format(
                    input_names=input_names_str, addon_name=addon_name.lower()
                ),
                table_host=table_host_query.format(
                    input_names=input_names_str, addon_name=addon_name.lower()
                ),
                table_index=table_index_query.format(
                    input_names=input_names_str, addon_name=addon_name.lower()
                ),
                table_account=table_account_query.format(addon_name=addon_name.lower()),
                table_input=table_input_query.format(addon_name=addon_name.lower()),
            )
        )

    if definition_json_name == default_definition_json_filename["errors_tab"]:
        content = (
            utils.get_j2_env()
            .get_template(definition_json_name)
            .render(
                errors_count=errors_count.format(addon_name=addon_name.lower()),
                errors_list=errors_list_query.format(addon_name=addon_name.lower()),
            )
        )

    return content


def generate_dashboard(
    global_config: global_config_lib.GlobalConfig,
    addon_name: str,
    definition_json_path: str,
) -> None:
    os.makedirs(os.path.normpath(definition_json_path), exist_ok=True)

    input_names = [el.get("name") for el in global_config.inputs]
    panels = global_config.dashboard.get("panels", [])
    panel_names = [panel["name"] for panel in panels]

    panels_to_display = {PANEL_DEFAULT: False, PANEL_CUSTOM: False}

    if PANEL_DEFAULT in panel_names:
        for definition_json_name in default_definition_json_filename.values():
            content = generate_dashboard_content(
                addon_name, input_names, definition_json_name
            )
            with open(
                os.path.join(definition_json_path, definition_json_name), "w"
            ) as file:
                file.write(content)
        panels_to_display[PANEL_DEFAULT] = True

    if PANEL_CUSTOM in panel_names:
        dashboard_components_path = os.path.abspath(
            os.path.join(
                global_config.original_path,
                os.pardir,
                "custom_dashboard.json",
            )
        )
        custom_content = get_custom_json_content(dashboard_components_path)
        with open(os.path.join(definition_json_path, "custom.json"), "w") as file:
            file.write(json.dumps(custom_content))
        panels_to_display[PANEL_CUSTOM] = True

    with open(
        os.path.join(definition_json_path, "panels_to_display.json"), "w"
    ) as file:
        file.write(json.dumps(panels_to_display))


def get_custom_json_content(custom_dashboard_path: str) -> Dict[Any, Any]:
    custom_dashbaord = load_custom_json(custom_dashboard_path)

    if not custom_dashbaord:
        logger.error(
            f"Custom dashboard page set in globalConfig.json but custom content not found. "
            f"Please verify if file {custom_dashboard_path} has a proper structure "
            f"(see https://splunk.github.io/addonfactory-ucc-generator/dashboard/)"
        )
        sys.exit(1)
    return custom_dashbaord


def load_custom_json(json_path: str) -> Dict[Any, Any]:
    try:
        with open(json_path) as dashboard_file:
            custom_dashbaord = json.load(dashboard_file)
    except FileNotFoundError:
        logger.error(
            f"Custom dashboard page set in globalConfig.json but "
            f"file {json_path} not found"
        )
        sys.exit(1)
    except json.decoder.JSONDecodeError:
        logger.error(f"{json_path} it's not a valid json file")
        sys.exit(1)
    return custom_dashbaord
