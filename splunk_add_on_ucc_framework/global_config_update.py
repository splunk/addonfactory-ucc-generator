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
import functools
import json
import logging

import yaml

logger = logging.getLogger("ucc_gen")

Loader = getattr(yaml, "CSafeLoader", yaml.SafeLoader)
yaml_load = functools.partial(yaml.load, Loader=Loader)


def _version_tuple(version_str):
    """
    convert string into tuple to compare version

    Args:
        version_str : raw string
    Returns:
        tuple : version into tupleformat
    """
    filled = []
    for point in version_str.split("."):
        filled.append(point.zfill(8))
    return tuple(filled)


def _handle_biased_terms(conf_entities: dict) -> dict:
    for entity in conf_entities:
        entity_option = entity.get("options")
        if entity_option and "whiteList" in entity_option:
            entity_option["allowList"] = entity_option.get("whiteList")
            del entity_option["whiteList"]
        if entity_option and "blackList" in entity_option:
            entity_option["denyList"] = entity_option.get("blackList")
            del entity_option["blackList"]
    return conf_entities


def _handle_biased_terms_update(schema_content: dict) -> dict:
    pages = schema_content.get("pages", {})
    ta_tabs = pages.get("configuration", {}).get("tabs", {})

    for tab in ta_tabs:
        conf_entities = tab.get("entity")
        tab["entity"] = _handle_biased_terms(conf_entities)

    if "inputs" in pages:
        services = pages.get("inputs", {}).get("services", {})
        for service in services:
            conf_entities = service.get("entity")
            service["entity"] = _handle_biased_terms(conf_entities)

    schema_content["meta"]["schemaVersion"] = "0.0.1"
    return schema_content


def _handle_dropping_api_version_update(schema_content: dict) -> dict:
    if schema_content["meta"].get("apiVersion"):
        del schema_content["meta"]["apiVersion"]
    schema_content["meta"]["schemaVersion"] = "0.0.3"
    return schema_content


def handle_global_config_update(config_path: str, is_global_config_yaml: bool) -> dict:
    """Handle changes in globalConfig file.

    Args:
        logger: Logger instance
        config_path: Path to globalConfig file
        is_global_config_yaml: True if globalconfig file is of type yaml

    Returns:
        Content of the updated globalConfig file in a dictionary format.
    """
    with open(config_path) as config_file:
        if is_global_config_yaml:
            schema_content = yaml_load(config_file)
        else:
            schema_content = json.load(config_file)

    version = schema_content.get("meta").get("schemaVersion", "0.0.0")

    if _version_tuple(version) < _version_tuple("0.0.1"):
        schema_content = _handle_biased_terms_update(schema_content)
        with open(config_path, "w") as config_file:
            if is_global_config_yaml:
                yaml.dump(schema_content, config_file, indent=4)
            else:
                json.dump(schema_content, config_file, ensure_ascii=False, indent=4)

    if _version_tuple(version) < _version_tuple("0.0.2"):
        ta_tabs = schema_content.get("pages").get("configuration", {}).get("tabs", {})

        for tab in ta_tabs:
            if tab["name"] == "account":
                conf_entities = tab.get("entity")
                oauth_state_enabled_entity = {}
                for entity in conf_entities:
                    if entity.get("field") == "oauth_state_enabled":
                        logger.warning(
                            "oauth_state_enabled field is no longer a separate "
                            "entity since UCC version 5.0.0. It is now an "
                            "option in the oauth field. Please update the "
                            "globalconfig file accordingly."
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

        is_inputs = "inputs" in schema_content.get("pages")
        if is_inputs:
            services = schema_content.get("pages").get("inputs", {}).get("services", {})
            for service in services:
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

        schema_content["meta"]["schemaVersion"] = "0.0.2"
        with open(config_path, "w") as config_file:
            if is_global_config_yaml:
                yaml.dump(schema_content, config_file, indent=4)
            else:
                json.dump(schema_content, config_file, ensure_ascii=False, indent=4)

    if _version_tuple(version) < _version_tuple("0.0.3"):
        schema_content = _handle_dropping_api_version_update(schema_content)
        with open(config_path, "w") as config_file:
            if is_global_config_yaml:
                yaml.dump(schema_content, config_file, indent=4)
            else:
                json.dump(schema_content, config_file, ensure_ascii=False, indent=4)

    return schema_content
