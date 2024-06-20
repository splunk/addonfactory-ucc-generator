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
    "resources_tab": "resources_tab_definition.json",
    "spike_side_panel_definition": "spike_side_panel_definition.json",
}

data_ingestion = (
    "index=_internal source=*license_usage.log type=Usage "
    "(s IN ({input_names})) | timechart sum(b) as Usage | "
    'rename Usage as \\"Data volume\\"'
)

data_ingestion_and_events = (
    "index=_internal source=*license_usage.log type=Usage "
    "(s IN ({input_names})) | timechart sum(b) as Usage "
    '| rename Usage as \\"Data volume\\" '
    "| join _time [search index=_internal source=*{addon_name}* action=events_ingested "
    '| timechart sum(n_events) as \\"Number of events\\" ]'
)
errors_count = (
    "index=_internal source=*{addon_name}* ERROR | timechart count as Errors by exc_l"
)
events_count = (
    "index=_internal source=*{addon_name}* action=events_ingested | "
    'timechart sum(n_events) as \\"Number of events\\"'
)

table_sourcetype_query = (
    "index=_internal source=*license_usage.log type=Usage (s IN ({input_names})) "
    "| stats sparkline(sum(b)) as sparkvolume, sum(b) as Bytes by st "
    "| join type=left st [search index = _internal source=*{addon_name}* action=events_ingested "
    "| stats latest(_time) AS le, sparkline(sum(n_events)) as sparkevent, "
    "sum(n_events) as events by sourcetype_ingested "
    '| rename sourcetype_ingested as st ] | makemv delim=\\",\\" sparkevent '
    '| eval \\"Last event\\" = strftime(le, \\"%e %b %Y %I:%M%p\\") '
    '| table st, Bytes, sparkvolume, events, sparkevent, \\"Last event\\" '
    '| rename st as \\"Source type\\", Bytes as \\"Data volume\\", events as \\"Number of events\\", '
    'sparkvolume as \\"Volume trendline (Bytes)\\", sparkevent as \\"Event trendline\\"'
)
table_source_query = (
    "index=_internal source=*license_usage.log type=Usage (s IN ({input_names})) "
    "| stats sparkline(sum(b)) as sparkvolume, sum(b) as Bytes by s "
    "| join type=left s [search index = _internal source=*{addon_name}* action=events_ingested "
    "| stats latest(_time) AS le, sparkline(sum(n_events)) as sparkevent, "
    "sum(n_events) as events by modular_input_name "
    '| rename modular_input_name as s ] | makemv delim=\\",\\" sparkevent '
    '| eval \\"Last event\\" = strftime(le, \\"%e %b %Y %I:%M%p\\") '
    '| table s, Bytes, sparkvolume, events, sparkevent, \\"Last event\\" '
    '| rename s as \\"Source\\", Bytes as \\"Data volume\\", events as \\"Number of events\\", '
    'sparkvolume as \\"Volume trendline (Bytes)\\", sparkevent as \\"Event trendline\\"'
)
table_host_query = (
    "index=_internal source=*license_usage.log type=Usage "
    "(s IN ({input_names})) "
    "| stats sparkline(sum(b)) as sparkvolume, sum(b) as Bytes by h "
    "| table h, Bytes, sparkvolume "
    '| rename h as \\"Host\\", Bytes as \\"Data volume\\", sparkvolume as \\"Volume trendline (Bytes)\\"'
)
table_index_query = (
    "index=_internal source=*license_usage.log type=Usage (s IN ({input_names})) "
    "| stats sparkline(sum(b)) as sparkvolume, sum(b) as Bytes by idx "
    "| join type=left idx [search index = _internal source=*{addon_name}* action=events_ingested "
    "| stats latest(_time) AS le, sparkline(sum(n_events)) as sparkevent, "
    "sum(n_events) as events by event_index "
    '| rename event_index as idx ] | makemv delim=\\",\\" sparkevent '
    '| eval \\"Last event\\" = strftime(le, \\"%e %b %Y %I:%M%p\\") '
    '| table idx, Bytes, sparkvolume, events, sparkevent, \\"Last event\\" '
    '| rename idx as \\"Index\\", Bytes as \\"Data volume\\", events as \\"Number of events\\", '
    'sparkvolume as \\"Volume trendline (Bytes)\\", sparkevent as \\"Event trendline\\"'
)
table_account_query = (
    "index = _internal source=*{addon_name}* action=events_ingested "
    "| stats latest(_time) as le, sparkline(sum(n_events)) as sparkevent, sum(n_events) as events by event_account "
    '| eval \\"Last event\\" = strftime(le, \\"%e %b %Y %I:%M%p\\") '
    '| table event_account, events, sparkevent, \\"Last event\\" '
    '| rename event_account as \\"Account\\", events as \\"Number of events\\", '
    'sparkevent as \\"Event trendline\\"'
)

table_input_query = (
    '| rest splunk_server=local /services/data/inputs/all | where $eai:acl.app$ = \\"{addon_name}\\" '
    '| eval Enabled=if(lower(disabled) IN (\\"1\\", \\"true\\", \\"t\\"), \\"no\\", \\"yes\\") '
    '| table title, Enabled | rename title as \\"event_input\\" | join type=left event_input [ '
    "search index = _internal source=*{addon_name_lowercase}* action=events_ingested "
    "| stats latest(_time) as le, sparkline(sum(n_events)) as sparkevent, sum(n_events) as events by event_input "
    '| eval \\"Last event\\" = strftime(le, \\"%e %b %Y %I:%M%p\\") ] | makemv delim=\\",\\" sparkevent '
    '| table event_input, Enabled, events, sparkevent, \\"Last event\\" '
    '| rename event_input as \\"Input\\", events as \\"Number of events\\", sparkevent as \\"Event trendline\\"'
)

errors_list_query = "index=_internal source=*{addon_name}* ERROR"

resource_cpu_query = (
    "index = _introspection component=PerProcess data.args=*{addon_name}* "
    '| timechart avg(data.pct_cpu) as \\"CPU (%)\\"'
)

resource_memory_query = (
    "index=_introspection component=PerProcess data.args=*{addon_name}* "
    '| timechart avg(data.pct_memory) as \\"Memory (%)\\"'
)


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
                table_input=table_input_query.format(
                    addon_name=addon_name, addon_name_lowercase=addon_name.lower()
                ),
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

    if definition_json_name == default_definition_json_filename["resources_tab"]:
        content = (
            utils.get_j2_env()
            .get_template(definition_json_name)
            .render(
                resource_cpu=resource_cpu_query.format(addon_name=addon_name.lower()),
                resource_memory=resource_memory_query.format(
                    addon_name=addon_name.lower()
                ),
            )
        )

    if (
        definition_json_name
        == default_definition_json_filename["spike_side_panel_definition"]
    ):
        content = utils.get_j2_env().get_template(definition_json_name).render()

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
    custom_dashboard = load_custom_json(custom_dashboard_path)

    if not custom_dashboard:
        logger.error(
            f"Custom dashboard page set in globalConfig.json but custom content not found. "
            f"Please verify if file {custom_dashboard_path} has a proper structure "
            f"(see https://splunk.github.io/addonfactory-ucc-generator/dashboard/)"
        )
        sys.exit(1)
    return custom_dashboard


def load_custom_json(json_path: str) -> Dict[Any, Any]:
    try:
        with open(json_path) as dashboard_file:
            custom_dashboard = json.load(dashboard_file)
    except FileNotFoundError:
        logger.error(
            f"Custom dashboard page set in globalConfig.json but "
            f"file {json_path} not found"
        )
        sys.exit(1)
    except json.decoder.JSONDecodeError:
        logger.error(f"{json_path} it's not a valid json file")
        sys.exit(1)
    return custom_dashboard
