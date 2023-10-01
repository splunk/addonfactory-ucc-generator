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
from typing import Any, Dict, Tuple, List

from splunk_add_on_ucc_framework import global_config as global_config_lib

logger = logging.getLogger("ucc_gen")


def _version_tuple(version: str) -> Tuple[str, ...]:
    """
    convert string into tuple to compare version

    Args:
        version_str : raw string
    Returns:
        tuple : version into tupleformat
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
    for tab in global_config.tabs:
        conf_entities = tab.get("entity")
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


def handle_global_config_update(global_config: global_config_lib.GlobalConfig) -> None:
    """Handle changes in globalConfig file."""
    current_schema_version = global_config.schema_version
    version = current_schema_version if current_schema_version else "0.0.0"
    logger.info(f"Current globalConfig schema version is {current_schema_version}")

    if _version_tuple(version) < _version_tuple("0.0.1"):
        _handle_biased_terms_update(global_config)
        global_config.dump(global_config.original_path)
        logger.info("Updated globalConfig schema to version 0.0.1")

    if _version_tuple(version) < _version_tuple("0.0.2"):
        for tab in global_config.tabs:
            if tab["name"] == "account":
                conf_entities = tab.get("entity")
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
        global_config.dump(global_config.original_path)
        logger.info("Updated globalConfig schema to version 0.0.2")

    if _version_tuple(version) < _version_tuple("0.0.3"):
        _handle_dropping_api_version_update(global_config)
        global_config.dump(global_config.original_path)
        logger.info("Updated globalConfig schema to version 0.0.3")
