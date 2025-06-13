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
from typing import Any, Dict, Tuple, List, Optional

from splunk_add_on_ucc_framework import global_config as global_config_lib, utils
from splunk_add_on_ucc_framework.entity import (
    collapse_entity,
    IntervalEntity,
)
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from splunk_add_on_ucc_framework.tabs import resolve_tab
from splunk_add_on_ucc_framework.exceptions import GlobalConfigValidatorException

logger = logging.getLogger("ucc_gen")


def _version_tuple(version: str) -> Tuple[str, ...]:
    """
    Convert string into tuple to compare versions.

    Args:
        version: raw string
    Returns:
        tuple: version into tuple format
    """
    filled = []
    for point in version.split("."):
        filled.append(point.zfill(8))
    return tuple(filled)


def _handle_biased_terms(conf_entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    for entity in conf_entities:
        entity_option = entity.get("options")
        if entity_option and "whiteList" in entity_option:
            entity_option["allowList"] = entity_option.get("whiteList")
            del entity_option["whiteList"]
        if entity_option and "blackList" in entity_option:
            entity_option["denyList"] = entity_option.get("blackList")
            del entity_option["blackList"]
    return conf_entities


def _handle_biased_terms_update(global_config: global_config_lib.GlobalConfig) -> None:
    for tab in global_config.configuration:
        conf_entities = tab.get("entity")

        if conf_entities is None:
            continue

        tab["entity"] = _handle_biased_terms(conf_entities)
    for service in global_config.inputs:
        conf_entities = service.get("entity")
        service["entity"] = _handle_biased_terms(conf_entities)
    global_config.update_schema_version("0.0.1")


def _handle_dropping_api_version_update(
    global_config: global_config_lib.GlobalConfig,
) -> None:
    if global_config.meta.get("apiVersion"):
        del global_config.meta["apiVersion"]
    global_config.update_schema_version("0.0.3")


def _handle_alert_action_updates(
    global_config: global_config_lib.GlobalConfig, global_config_path: str
) -> None:
    if global_config.has_alerts():
        updated_alerts = []
        for alert in global_config.alerts:
            modified_alert = {}
            for k, v in alert.items():
                if k in ["activeResponse", "adaptiveResponse"]:
                    # set default values for the below properties
                    v["supportsAdhoc"] = v.get("supportsAdhoc", False)
                    v["supportsCloud"] = v.get("supportsCloud", True)
                if k == "activeResponse":
                    logger.warning(
                        "'activeResponse' is deprecated. Please use 'adaptiveResponse' instead."
                    )
                    modified_alert["adaptiveResponse"] = v
                else:
                    modified_alert[k] = v

            # in either case, we create a new list and fill it with updated alerts, if any
            updated_alerts.append(modified_alert)
        global_config._content["alerts"] = updated_alerts
        global_config.dump(global_config_path)
    global_config.update_schema_version("0.0.4")


def _handle_xml_dashboard_update(
    global_config: global_config_lib.GlobalConfig, global_config_path: str
) -> None:
    panels_to_migrate = [
        "addon_version",
        "events_ingested_by_sourcetype",
        "errors_in_the_addon",
    ]
    if global_config.has_dashboard():
        panels = [panel["name"] for panel in global_config.dashboard["panels"]]
        deprecated_panels = [el for el in panels if el in panels_to_migrate]
        if deprecated_panels:
            logger.warning(
                f"deprecated dashboard panels found: {deprecated_panels}. "
                f"Instead, use just one panel: \"'name': 'default'\""
            )
            global_config.dashboard["panels"] = [{"name": "default"}]
            global_config.dump(global_config_path)
    global_config.update_schema_version("0.0.5")


def handle_global_config_update(
    global_config: global_config_lib.GlobalConfig, global_config_path: str
) -> None:
    """Handle changes in globalConfig file."""
    version = global_config.schema_version or "0.0.0"
    logger.info(f"Current globalConfig schema version is {version}")

    allowed_versions_of_schema_version = {
        "0.0.0",
        "0.0.1",
        "0.0.2",
        "0.0.3",
        "0.0.4",
        "0.0.5",
        "0.0.6",
        "0.0.7",
        "0.0.8",
        "0.0.9",
    }

    if version not in allowed_versions_of_schema_version:
        logger.warning(
            "Schema version is not in the allowed versions, setting it to 0.0.0"
        )
        version = "0.0.0"

    if _version_tuple(version) < _version_tuple("0.0.1"):
        _handle_biased_terms_update(global_config)
        global_config.dump(global_config_path)
        logger.info("Updated globalConfig schema to version 0.0.1")

    if _version_tuple(version) < _version_tuple("0.0.2"):
        for tab in global_config.configuration:
            if tab.get("type") in ["loggingTab", "proxyTab"]:
                continue
            if tab["name"] == "account":
                conf_entities = tab.get("entity")

                if conf_entities is None:
                    continue

                oauth_state_enabled_entity = {}
                for entity in conf_entities:
                    if entity.get("field") == "oauth_state_enabled":
                        logger.warning(
                            "oauth_state_enabled field is no longer a separate "
                            "entity since UCC version 5.0.0. It is now an "
                            "option in the oauth field. Please update the "
                            "globalConfig file accordingly."
                        )
                        oauth_state_enabled_entity = entity

                    if entity.get("field") == "oauth" and not entity.get(
                        "options", {}
                    ).get("oauth_state_enabled"):
                        entity["options"]["oauth_state_enabled"] = False

                if oauth_state_enabled_entity:
                    conf_entities.remove(oauth_state_enabled_entity)

            tab_options = tab.get("options", {})
            if tab_options.get("onChange"):
                logger.error(
                    "The onChange option is no longer supported since UCC "
                    "version 5.0.0. You can use custom hooks to implement "
                    "these actions."
                )
                del tab_options["onChange"]
            if tab_options.get("onLoad"):
                logger.error(
                    "The onLoad option is no longer supported since UCC "
                    "version 5.0.0. You can use custom hooks to implement "
                    "these actions."
                )
                del tab_options["onLoad"]

        if global_config.has_inputs():
            for service in global_config.inputs:
                service_options = service.get("options", {})
                if service_options.get("onChange"):
                    logger.error(
                        "The onChange option is no longer supported since UCC "
                        "version 5.0.0. You can use custom hooks to implement "
                        "these actions."
                    )
                    del service_options["onChange"]
                if service_options.get("onLoad"):
                    logger.error(
                        "The onLoad option is no longer supported since UCC "
                        "version 5.0.0. You can use custom hooks to implement "
                        "these actions."
                    )
                    del service_options["onLoad"]
        global_config.update_schema_version("0.0.2")
        global_config.dump(global_config_path)
        logger.info("Updated globalConfig schema to version 0.0.2")

    if _version_tuple(version) < _version_tuple("0.0.3"):
        _handle_dropping_api_version_update(global_config)
        global_config.dump(global_config_path)
        logger.info("Updated globalConfig schema to version 0.0.3")

    if _version_tuple(version) < _version_tuple("0.0.4"):
        _handle_alert_action_updates(global_config, global_config_path)
        global_config.dump(global_config_path)
        logger.info("Updated globalConfig schema to version 0.0.4")

    if _version_tuple(version) < _version_tuple("0.0.5"):
        _handle_xml_dashboard_update(global_config, global_config_path)
        global_config.dump(global_config_path)
        logger.info("Updated globalConfig schema to version 0.0.5")

    if _version_tuple(version) < _version_tuple("0.0.6"):
        global_config.update_schema_version("0.0.6")
        _dump_with_migrated_tabs(global_config, global_config_path)
        logger.info("Updated globalConfig schema to version 0.0.6")

    if _version_tuple(version) < _version_tuple("0.0.7"):
        global_config.update_schema_version("0.0.7")
        _dump_with_migrated_entities(
            global_config, global_config_path, [IntervalEntity]
        )
        logger.info("Updated globalConfig schema to version 0.0.7")

    if _version_tuple(version) < _version_tuple("0.0.8"):
        _stop_build_on_placeholder_usage(global_config)
        global_config.dump(global_config_path)
        logger.info("Updated globalConfig schema to version 0.0.8")

    if _version_tuple(version) < _version_tuple("0.0.9"):
        _dump_enable_from_global_config(global_config)
        global_config.dump(global_config_path)
        logger.info("Updated globalConfig schema to version 0.0.9")


def _dump_with_migrated_tabs(global_config: GlobalConfig, path: str) -> None:
    for i, tab in enumerate(
        global_config.content.get("pages", {}).get("configuration", {}).get("tabs", [])
    ):
        if tab.get("type") == "proxyTab":
            # Collapsing the tab is not required for ProxyTab because we can't be certain
            # that a particular tab is a Proxy tab, as we can with a Logging tab.
            continue
        global_config.content["pages"]["configuration"]["tabs"][i] = _collapse_tab(tab)

    _dump(global_config.content, path, global_config.is_yaml)


def _dump_with_migrated_entities(
    global_config: GlobalConfig,
    path: str,
    entity_type: List[Any],
) -> None:
    _collapse_entities(
        global_config.content.get("pages", {}).get("inputs", {}).get("services"),
        entity_type,
    )
    _collapse_entities(
        global_config.content.get("pages", {}).get("configuration", {}).get("tabs"),
        entity_type,
    )
    _dump(global_config.content, path, global_config.is_yaml)


def _collapse_entities(
    items: Optional[List[Dict[Any, Any]]],
    entity_type: List[Any],
) -> None:
    if items is None:
        return

    for item in items:
        for i, entity in enumerate(item.get("entity", [])):
            item["entity"][i] = collapse_entity(entity, entity_type)


def _dump(content: Dict[Any, Any], path: str, is_yaml: bool) -> None:
    if is_yaml:
        utils.dump_yaml_config(content, path)
    else:
        utils.dump_json_config(content, path)


def _collapse_tab(tab: Dict[str, Any]) -> Dict[str, Any]:
    return resolve_tab(tab).short_form()


def _stop_build_on_placeholder_usage(
    global_config: global_config_lib.GlobalConfig,
) -> None:
    """
    Stops the build of addon and logs error if placeholder is used.
    Deprecation Notice: https://github.com/splunk/addonfactory-ucc-generator/issues/831.
    Allows to update the schema version if placeholder isn't found.
    """
    log_msg = (
        "`placeholder` option found for %s '%s' -> entity field '%s'. "
        "We recommend to use `help` instead (https://splunk.github.io/addonfactory-ucc-generator/entity/)."
        "\n\tDeprecation notice: https://github.com/splunk/addonfactory-ucc-generator/issues/831."
    )
    exc_msg = (
        "`placeholder` option found for %s '%s'. It has been removed from UCC. "
        "We recommend to use `help` instead (https://splunk.github.io/addonfactory-ucc-generator/entity/)."
    )
    for tab in global_config.configuration:
        for entity in tab.get("entity", []):
            if "placeholder" in entity.get("options", {}):
                logger.error(
                    log_msg % ("configuration tab", tab["name"], entity["field"])
                )
                raise GlobalConfigValidatorException(
                    exc_msg % ("configuration tab", tab["name"])
                )
    services = global_config.inputs
    if not services:
        return
    for service in services:
        for entity in service.get("entity", {}):
            if "placeholder" in entity.get("options", {}):
                logger.error(
                    log_msg % ("input service", service["name"], entity["field"])
                )
                raise GlobalConfigValidatorException(
                    exc_msg % ("input service", service["name"])
                )
    global_config.update_schema_version("0.0.8")


def _dump_enable_from_global_config(
    global_config: global_config_lib.GlobalConfig,
) -> None:
    if global_config.has_inputs():
        # Fetch the table object from global_config
        table = global_config.content.get("pages", {}).get("inputs", {}).get("table")

        if table:  # If the table exists
            actions = table.get("actions", [])
            if "enable" in actions:
                logger.warning(
                    "`enable` attribute found in input's page table action."
                    + f" Removing 'enable' from actions: {actions}"
                )
                actions.remove("enable")
                table["actions"] = actions  # Update the actions in the global_config

        else:  # If no table present, loop through services in inputs
            services = (
                global_config.content.get("pages", {})
                .get("inputs", {})
                .get("services", [])
            )
            for service in services:
                service_table = service.get("table", {})
                actions = service_table.get("actions", [])
                if "enable" in actions:
                    logger.warning(
                        f"`enable` attribute found in service {service.get('name')}'s table action."
                        + f" Removing 'enable' from actions in service: {actions}"
                    )
                    actions.remove("enable")
                    service_table[
                        "actions"
                    ] = actions  # Update the actions in the service's table

    global_config.update_schema_version("0.0.9")
