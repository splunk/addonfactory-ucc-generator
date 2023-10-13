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

import json
import os
import re
from typing import Any, Dict, List
import logging

import jsonschema

from splunk_add_on_ucc_framework import dashboard as dashboard_lib
from splunk_add_on_ucc_framework import global_config as global_config_lib

logger = logging.getLogger("ucc_gen")


class GlobalConfigValidatorException(Exception):
    pass


class GlobalConfigValidator:
    """
    GlobalConfigValidator implements different validation for globalConfig file.
    Custom validation should be implemented here.
    """

    def __init__(self, source_dir: str, global_config: global_config_lib.GlobalConfig):
        self._source_dir = source_dir
        self._config = global_config.content

    def _validate_config_against_schema(self) -> None:
        """
        Validates config against JSON schema.
        Raises jsonschema.ValidationError if config is not valid.
        """
        schema_path = os.path.join(self._source_dir, "schema", "schema.json")
        with open(schema_path) as f_schema:
            schema_raw = f_schema.read()
            schema = json.loads(schema_raw)
        try:
            return jsonschema.validate(instance=self._config, schema=schema)
        except jsonschema.ValidationError as e:
            raise GlobalConfigValidatorException(e.message)

    def _validate_configuration_tab_table_has_name_field(self) -> None:
        """
        Validates that if a configuration tab should be rendered as a table,
        then it needs to have an entity which has field "name".
        """
        pages = self._config["pages"]
        configuration = pages["configuration"]
        tabs = configuration["tabs"]
        for tab in tabs:
            if "table" in tab:
                entities = tab["entity"]
                has_name_field = False
                for entity in entities:
                    if entity["field"] == "name":
                        has_name_field = True
                        break
                if not has_name_field:
                    raise GlobalConfigValidatorException(
                        f"Tab '{tab['name']}' should have entity with field 'name'"
                    )

    def _validate_custom_rest_handlers(self) -> None:
        """
        Validates that only "restHandlerName" or both "restHandlerModule" and
        "restHandlerClass" is present in the input configuration. Also validates
        that both "restHandlerModule" and "restHandlerClass" is present if any
        of them are present.

        The valid scenarios:
            * only restHandlerName is present
            * both restHandlerModule and restHandlerClass is present
        Everything other combination is considered invalid.
        """
        pages = self._config["pages"]
        inputs = pages.get("inputs")
        if inputs is None:
            return
        services = inputs["services"]
        for service in services:
            rest_handler_name = service.get("restHandlerName")
            rest_handler_module = service.get("restHandlerModule")
            rest_handler_class = service.get("restHandlerClass")
            if rest_handler_name is not None and (
                rest_handler_module is not None or rest_handler_class is not None
            ):
                raise GlobalConfigValidatorException(
                    f"Input '{service['name']}' has both 'restHandlerName' and "
                    f"'restHandlerModule' or 'restHandlerClass' fields present. "
                    f"Please use only 'restHandlerName' or 'restHandlerModule' "
                    f"and 'restHandlerClass'."
                )
            if (rest_handler_module is not None and rest_handler_class is None) or (
                rest_handler_module is None and rest_handler_class is not None
            ):
                raise GlobalConfigValidatorException(
                    f"Input '{service['name']}' should have both "
                    f"'restHandlerModule' and 'restHandlerClass' fields "
                    f"present, only 1 of them was found."
                )

    def _validate_file_type_entity(self) -> None:
        """
        Validates that file-based field has all necessary fields.
        Things should be provided in case of file field:
            * options field
            * supportedFileTypes field should be present in options
        Also if file is encrypted but not required, this is not supported,
        and we need to throw a validation error.
        """
        pages = self._config["pages"]
        configuration = pages["configuration"]
        tabs = configuration["tabs"]
        for tab in tabs:
            entities = tab["entity"]
            for entity in entities:
                if entity["type"] == "file":
                    is_required = entity.get("required", False)
                    is_encrypted = entity.get("encrypted", False)
                    if is_encrypted and not is_required:
                        raise GlobalConfigValidatorException(
                            f"Field {entity['field']} uses type 'file' which is encrypted and not required, "
                            f"this is not supported"
                        )
                    options = entity.get("options")
                    if options is None:
                        raise GlobalConfigValidatorException(
                            f"Options field for the file type should be present "
                            f"for '{entity['field']}' field."
                        )
                    supported_file_types = options.get("supportedFileTypes")
                    if supported_file_types is None:
                        raise GlobalConfigValidatorException(
                            f"You should define your supported file types in "
                            f"the `supportedFileTypes` field for the "
                            f"'{entity['field']}' field."
                        )

    def _validate_string_validator(
        self, entity_field: str, validator: Dict[str, Any]
    ) -> None:
        """
        Validates string validator. maxLength should be greater or equal
        than minLength.
        """
        if validator["maxLength"] < validator["minLength"]:
            raise GlobalConfigValidatorException(
                f"Entity '{entity_field}' has incorrect string validator, "
                f"'maxLength' should be greater or equal than 'minLength'."
            )

    def _validate_number_validator(
        self, entity_field: str, validator: Dict[str, Any]
    ) -> None:
        """
        Validates number validator, both values in range should be numbers and
        first one should be smaller than the second one.
        """
        validator_range = validator["range"]
        if len(validator_range) != 2:
            raise GlobalConfigValidatorException(
                f"Entity '{entity_field}' has incorrect number validator, "
                f"it should have 2 elements under 'range' field."
            )
        # Schema already checks that the values in the 'range' field are
        # numbers.
        if validator_range[1] < validator_range[0]:
            raise GlobalConfigValidatorException(
                f"Entity '{entity_field}' has incorrect number validator, "
                f"second element should be greater or equal than first element."
            )

    def _validate_regex_validator(
        self, entity_field: str, validator: Dict[str, Any]
    ) -> None:
        """
        Validates regex validator, provided regex should at least be compilable.
        """
        try:
            re.compile(validator["pattern"])
        except re.error:
            raise GlobalConfigValidatorException(
                f"Entity '{entity_field}' has incorrect regex validator, "
                f"pattern provided in the 'pattern' field is not compilable."
            )

    def _validate_entity_validators(self, entity: Dict[str, Any]) -> None:
        """
        Validates entity validators.
        """
        validators = entity.get("validators", [])
        for validator in validators:
            if validator["type"] == "string":
                self._validate_string_validator(entity["field"], validator)
            if validator["type"] == "number":
                self._validate_number_validator(entity["field"], validator)
            if validator["type"] == "regex":
                self._validate_regex_validator(entity["field"], validator)

    def _validate_validators(self) -> None:
        """
        Validates both configuration and services validators, currently string,
        number and regex are supported.
        """
        pages = self._config["pages"]
        configuration = pages["configuration"]
        tabs = configuration["tabs"]
        for tab in tabs:
            entities = tab["entity"]
            for entity in entities:
                self._validate_entity_validators(entity)

        inputs = pages.get("inputs")
        if inputs is None:
            return
        services = inputs["services"]
        for service in services:
            entities = service["entity"]
            for entity in entities:
                self._validate_entity_validators(entity)

    @staticmethod
    def _find_duplicates_in_list(_list: List[Any]) -> bool:
        return len(set(_list)) != len(_list)

    def _validate_children_duplicates(
        self, children: List[Dict[str, Any]], entity_label: str
    ) -> None:
        """
        Validates duplicates under children key in autoCompleteFields
        for fields under keys: label, value
        """
        labels, values = [], []
        for child in children:
            labels.append(child["label"].lower())
            values.append(child["value"].lower())
        if self._find_duplicates_in_list(values) or self._find_duplicates_in_list(
            labels
        ):
            raise GlobalConfigValidatorException(
                f"Duplicates found for autoCompleteFields children in entity '{entity_label}'"
            )

    def _validate_autoCompleteFields_duplicates(
        self, options: Dict[str, Any], entity_label: str
    ) -> None:
        """
        Validates duplicates in autoCompleteFields keys
        for fields under keys: label, value
        If autoCompleteFields has children key, children validator is called
        """
        labels, values = [], []
        for field in options["autoCompleteFields"]:
            labels.append(field.get("label").lower())
            children = field.get("children")
            if children:
                self._validate_children_duplicates(children, entity_label)
            else:
                values.append(field.get("value").lower())
        if self._find_duplicates_in_list(values) or self._find_duplicates_in_list(
            labels
        ):
            raise GlobalConfigValidatorException(
                f"Duplicates found for autoCompleteFields: '{entity_label}'"
            )

    def _validate_multilevel_menu(self) -> None:
        inputs = self._config.get("pages").get("inputs")
        if inputs:
            groups_menu = inputs.get("groupsMenu")
            if groups_menu:
                names, titles = [], []
                for group in groups_menu:
                    names.append(group.get("groupName").lower())
                    titles.append(group.get("groupTitle").lower())
                    group_services = group.get("groupServices")
                    if group_services:
                        for serviceName in group_services:
                            if not any(
                                serviceName == service.get("name")
                                for service in inputs.get("services")
                            ):
                                raise GlobalConfigValidatorException(
                                    f"{serviceName} ServiceName in the "
                                    f"multi-level menu does not match any "
                                    f"services name."
                                )
                    else:
                        if not any(
                            group.get("groupName") == service.get("name")
                            and group.get("groupTitle") == service.get("title")
                            for service in inputs.get("services")
                        ):
                            raise GlobalConfigValidatorException(
                                f'{group.get("groupName")} groupName or '
                                f'{group.get("groupTitle")} groupTitle in the '
                                f"multi-level menu does not match any services "
                                f"name or title."
                            )

                if self._find_duplicates_in_list(
                    names
                ) or self._find_duplicates_in_list(titles):
                    raise GlobalConfigValidatorException(
                        "Duplicates found for multi-level menu groups' names or titles."
                    )

    def _validate_entity_duplicates(self, entity: List[Dict[str, Any]]) -> None:
        """
        Validates duplicates in entity keys
        for fields under keys: field, label
        If entity has autoCompleteFields key, autoCompleteFields validator is called
        """
        fields, labels = [], []
        for _entity in entity:
            fields.append(_entity["field"].lower())
            labels.append(_entity["label"].lower())
            options = _entity.get("options")
            if options and options.get("autoCompleteFields"):
                self._validate_autoCompleteFields_duplicates(
                    _entity["options"], _entity["label"]
                )
        if self._find_duplicates_in_list(fields) or self._find_duplicates_in_list(
            labels
        ):
            raise GlobalConfigValidatorException(
                "Duplicates found for entity field or label"
            )

    def _validate_tabs_duplicates(self, tabs: List[Dict[str, Any]]) -> None:
        """
        Validates duplicates in tab keys under configuration
        for fields under keys: name, title
        Calls for entity validator, as at least one entity is required in schema
        """
        names, titles = [], []
        for tab in tabs:
            names.append(tab["name"].lower())
            titles.append(tab["title"].lower())

            self._validate_entity_duplicates(tab["entity"])
        if self._find_duplicates_in_list(names) or self._find_duplicates_in_list(
            titles
        ):
            raise GlobalConfigValidatorException(
                "Duplicates found for tabs names or titles"
            )

    def _validate_inputs_duplicates(self, inputs: Dict[str, Any]) -> None:
        """
        Validates duplicates in tab keys under configuration
        for fields under keys: name, title
        Inputs are not required in schema
        """
        names, titles = [], []
        for service in inputs["services"]:
            names.append(service["name"].lower())
            titles.append(service["title"].lower())

            self._validate_entity_duplicates(service["entity"])

        if self._find_duplicates_in_list(names) or self._find_duplicates_in_list(
            titles
        ):
            raise GlobalConfigValidatorException(
                "Duplicates found for inputs (services) names or titles"
            )

    def _validate_duplicates(self) -> None:
        """
        Validates duplicates for both tabs and services (inputs). Inputs however are
        not required in schema, so this checks if globalConfig has inputs
        """
        pages = self._config["pages"]

        self._validate_tabs_duplicates(pages["configuration"]["tabs"])

        inputs = pages.get("inputs")
        if inputs:
            self._validate_inputs_duplicates(inputs)

    def _validate_alerts(self) -> None:
        # TODO: test cases should be added here.
        alerts = self._config.get("alerts", [])
        for alert in alerts:
            fields = []
            alert_entity = alert.get("entity")
            if alert_entity is None:
                continue
            for entity in alert_entity:
                if entity.get("field") in fields:
                    raise GlobalConfigValidatorException(
                        "Field names should be unique across alerts"
                    )
                else:
                    fields.append(entity.get("field"))
                entity_type = entity.get("type")
                if entity_type in ("radio", "singleSelect"):
                    if not entity.get("options"):
                        raise GlobalConfigValidatorException(
                            f"{entity_type} type must have options parameter"
                        )
                elif (
                    entity.get("options") and entity_type != "singleSelectSplunkSearch"
                ):
                    raise GlobalConfigValidatorException(
                        f"{entity_type} type must not contain options parameter"
                    )
                if entity_type in ("singleSelectSplunkSearch",):
                    if not all(
                        [
                            entity.get("search"),
                            entity.get("valueField"),
                            entity.get("labelField"),
                        ]
                    ):
                        raise GlobalConfigValidatorException(
                            f"{entity_type} type must have search, valueLabel and valueField parameters"
                        )
                elif any(
                    [
                        entity.get("search"),
                        entity.get("valueField"),
                        entity.get("labelField"),
                    ]
                ):
                    raise GlobalConfigValidatorException(
                        f"{entity_type} type must not contain search, valueField or labelField parameter"
                    )

    def _validate_panels(self) -> None:
        """
        Validates if the panels defined in the configuration are supported.
        """
        dashboard = self._config["pages"].get("dashboard")
        if dashboard:
            for panel in dashboard["panels"]:
                if panel["name"] not in dashboard_lib.SUPPORTED_PANEL_NAMES:
                    raise GlobalConfigValidatorException(
                        f"'{panel['name']}' is not a supported panel name. "
                        f"Supported panel names: {dashboard_lib.SUPPORTED_PANEL_NAMES_READABLE}"
                    )

    def _warn_on_placeholder_usage(self) -> None:
        """
        Warns if placeholder is used.
        More details here: https://github.com/splunk/addonfactory-ucc-generator/issues/831.
        """
        pages = self._config["pages"]
        configuration = pages["configuration"]
        tabs = configuration["tabs"]
        for tab in tabs:
            for entity in tab["entity"]:
                if "placeholder" in entity.get("options", {}):
                    logger.warning(
                        f"`placeholder` option found for configuration tab '{tab['name']}' "
                        f"-> entity field '{entity['field']}'. "
                        f"Please take a look at https://github.com/splunk/addonfactory-ucc-generator/issues/831."
                    )
        inputs = pages.get("inputs")
        if inputs is None:
            return
        services = inputs["services"]
        for service in services:
            for entity in service["entity"]:
                if "placeholder" in entity.get("options", {}):
                    logger.warning(
                        f"`placeholder` option found for input service '{service['name']}' "
                        f"-> entity field '{entity['field']}'. "
                        f"Please take a look at https://github.com/splunk/addonfactory-ucc-generator/issues/831."
                    )

    def _validate_checkbox_group(self) -> None:
        pages = self._config["pages"]
        inputs = pages.get("inputs")
        if inputs is None:
            return
        services = inputs["services"]
        for service in services:
            for entity in service["entity"]:
                if entity["type"] == "checkboxGroup":
                    row_field_names = []
                    for row in entity["options"]["rows"]:
                        if row["field"] in row_field_names:
                            raise GlobalConfigValidatorException(
                                f"Entity {entity['field']} has duplicate field ({row['field']}) in options.rows"
                            )
                        row_field_names.append(row["field"])
                    groups = entity["options"].get("groups")
                    if groups is None:
                        return
                    group_used_field_names = []
                    for group in groups:
                        for group_field_name in group["fields"]:
                            if group_field_name not in row_field_names:
                                raise GlobalConfigValidatorException(
                                    f"Entity {entity['field']} uses field ({group_field_name}) "
                                    f"which is not defined in options.rows"
                                )
                            if group_field_name in group_used_field_names:
                                raise GlobalConfigValidatorException(
                                    f"Entity {entity['field']} has duplicate field ({group_field_name}) "
                                    f"in options.groups"
                                )
                            group_used_field_names.append(group_field_name)

    def _validate_group_labels(self) -> None:
        pages = self._config["pages"]
        inputs = pages.get("inputs")
        if inputs is None:
            return
        services = inputs["services"]
        for service in services:
            groups = service.get("groups")
            if groups is None:
                continue
            service_group_labels = []
            for group in groups:
                group_label = group["label"]
                if group_label in service_group_labels:
                    raise GlobalConfigValidatorException(
                        f"Service {service['name']} has duplicate labels in groups"
                    )
                service_group_labels.append(group_label)

    def validate(self) -> None:
        self._validate_config_against_schema()
        self._validate_configuration_tab_table_has_name_field()
        self._validate_custom_rest_handlers()
        self._validate_file_type_entity()
        self._validate_validators()
        self._validate_multilevel_menu()
        self._validate_duplicates()
        self._validate_alerts()
        self._validate_panels()
        self._warn_on_placeholder_usage()
        self._validate_checkbox_group()
        self._validate_group_labels()
