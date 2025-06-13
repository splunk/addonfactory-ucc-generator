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

import json
import os
import re
from typing import Any, Dict, List
import logging
import itertools
from splunk_add_on_ucc_framework.const import SPLUNK_COMMANDS

import jsonschema

from splunk_add_on_ucc_framework import dashboard as dashboard_lib
from splunk_add_on_ucc_framework import global_config as global_config_lib
from splunk_add_on_ucc_framework.tabs import Tab
from splunk_add_on_ucc_framework.exceptions import GlobalConfigValidatorException

logger = logging.getLogger("ucc_gen")

# The entity types that do not allow to add validators (so the warning will not appear)
ENTITY_TYPES_WITHOUT_VALIDATORS = {
    "radio",
    "index",
    "helpLink",
    "checkbox",
    "interval",
    "custom",
}


class GlobalConfigValidator:
    """
    GlobalConfigValidator implements different validation for globalConfig file.
    Custom validation should be implemented here.
    """

    def __init__(
        self,
        internal_root_dir: str,
        global_config: global_config_lib.GlobalConfig,
        source: str = "",
    ):
        self._internal_root_dir = internal_root_dir
        self._source_dir = source
        self._global_config = global_config
        self._config = global_config.content
        self.resolved_configuration = global_config.resolved_configuration

    def _validate_config_against_schema(self) -> None:
        """
        Validates config against JSON schema.
        Raises jsonschema.ValidationError if config is not valid.
        """
        schema_path = os.path.join(self._internal_root_dir, "schema", "schema.json")
        with open(schema_path, encoding="utf-8") as f_schema:
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
        for tab in self.resolved_configuration:
            if "table" in tab:
                entities = tab.get("entity", [])
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
        for tab in self.resolved_configuration:
            # For customTab entity is optional
            entities = tab.get("entity", [])
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

    def _validate_interval(self, entity: Dict[str, Any]) -> None:
        """
        Validate options of the 'interval' entity
        """
        if "range" in entity.get("options", {}):
            self._validate_number_validator(entity["field"], entity["options"])

    def _validate_entity_validators(self, entity: Dict[str, Any]) -> None:
        """
        Validates entity validators.
        """
        validators = entity.get("validators", [])

        if should_warn_on_empty_validators(entity):
            logger.warning(
                f"The field '{entity.get('field')}' does not have a validator specified. It's recommended "
                "to add a validator to ensure the security and integrity of the input data. For more "
                "information, please refer to the documentation."
            )

        for validator in validators:
            if validator["type"] == "string":
                self._validate_string_validator(entity["field"], validator)
            if validator["type"] == "number":
                self._validate_number_validator(entity["field"], validator)
            if validator["type"] == "regex":
                self._validate_regex_validator(entity["field"], validator)

        if entity.get("type", "") == "interval":
            self._validate_interval(entity)

    def _validate_validators(self) -> None:
        """
        Validates both configuration and services validators, currently string,
        number and regex are supported.
        """
        pages = self._config["pages"]
        for tab in self.resolved_configuration:
            entities = tab.get("entity", [])
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
            child_value = child["value"]
            if isinstance(child_value, str):
                values.append(child_value.lower())
            else:
                values.append(child_value)
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
                field_value = field.get("value")
                if isinstance(field_value, str):
                    values.append(field_value.lower())
                else:
                    values.append(field_value)
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
            if "label" in _entity:
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

    def _validate_tabs_duplicates(self, tabs: List[Tab]) -> None:
        """
        Validates duplicates in tab keys under configuration
        for fields under keys: name, title
        Calls for entity validator, as at least one entity is required in schema
        """
        names, titles, types = [], [], []
        for tab in tabs:
            names.append(tab["name"].lower())
            titles.append(tab["title"].lower())

            if tab.tab_type is not None:
                types.append(tab.tab_type.lower())

            self._validate_entity_duplicates(tab.get("entity", []))
        if (
            self._find_duplicates_in_list(names)
            or self._find_duplicates_in_list(titles)
            or self._find_duplicates_in_list(types)
        ):
            raise GlobalConfigValidatorException(
                "Duplicates found for tabs names, titles or types"
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
        self._validate_tabs_duplicates(self.resolved_configuration)

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

    def _validate_checkbox_group(self) -> None:
        pages = self._config["pages"]
        inputs = pages.get("inputs")
        if inputs is None:
            return
        services = inputs["services"]
        for service in services:
            for entity in service["entity"]:
                if (
                    entity["type"] == "checkboxGroup"
                    or entity["type"] == "checkboxTree"
                ):
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

    def _validate_groups(self) -> None:
        pages = self._config["pages"]
        inputs = pages.get("inputs")
        if inputs is None:
            return
        services = inputs["services"]
        for service in services:
            groups = service.get("groups")
            if groups is None:
                continue
            entities = service["entity"]
            entity_fields = []
            for entity in entities:
                entity_fields.append(entity["field"])
            service_group_labels = []
            for group in groups:
                group_label = group["label"]
                if group_label in service_group_labels:
                    raise GlobalConfigValidatorException(
                        f"Service {service['name']} has duplicate labels in groups"
                    )
                service_group_labels.append(group_label)
            for group in groups:
                group_fields = group["fields"]
                for group_field in group_fields:
                    if group_field not in entity_fields:
                        raise GlobalConfigValidatorException(
                            f"Service {service['name']} uses group field {group_field} which is not defined in entity"
                        )

    def _is_circular_modification(
        self,
        mods: List[Any],
        visited: Dict[str, str],
        all_entity_fields: List[Any],
        current_field: str,
    ) -> Dict[str, str]:
        """
        Checks if there is circular modification based on visited list and DFS algorithm
        """
        DEAD_END = "dead_end"
        VISITING = "visited"
        visited[current_field] = VISITING

        current_field_mods = next(
            (mod for mod in mods if mod["fieldId"] == current_field), None
        )
        if current_field_mods is None:
            # no more dependent modification fields
            visited[current_field] = DEAD_END
            return visited

        if current_field in current_field_mods["influenced_fields_value_change"]:
            # field can modify itself except "value" property
            raise GlobalConfigValidatorException(
                f"""Field '{current_field}' tries to modify itself value"""
            )

        for influenced_field in current_field_mods["influenced_fields"]:
            if influenced_field not in all_entity_fields:
                raise GlobalConfigValidatorException(
                    f"""Modification in field '{current_field}' for not existing field '{influenced_field}'"""
                )

            if influenced_field in current_field_mods["influenced_fields_value_change"]:
                if visited[influenced_field] == VISITING:
                    raise GlobalConfigValidatorException(
                        f"""Circular modifications for field '{influenced_field}' in field '{current_field}'"""
                    )
                # check next influenced by value change field
                visited = self._is_circular_modification(
                    mods, visited, all_entity_fields, influenced_field
                )

        # All dependent modifications fields are dead_end
        visited[current_field] = DEAD_END
        return visited

    def _check_if_circular_modification(
        self,
        all_entity_fields: List[Any],
        fields_with_mods: List[Any],
        modifications: List[Any],
    ) -> None:
        visited = {field: "not_visited" for field in all_entity_fields}
        for start_field in fields_with_mods:
            # DFS algorithm for all fields with modifications
            visited = self._is_circular_modification(
                modifications, visited, all_entity_fields, start_field
            )

    @staticmethod
    def _get_mods_data_for_single_entity(
        entity: Dict[str, Any],
    ) -> List[Any]:
        """
        Get modification entity data as lists
        """
        entity_modifications = []
        if "modifyFieldsOnValue" in entity:
            influenced_fields_value_change = set()
            influenced_fields = set()
            for mods in entity["modifyFieldsOnValue"]:
                for mod in mods["fieldsToModify"]:
                    influenced_fields.add(mod["fieldId"])

                    if (
                        mod.get("value") is not None
                    ):  # circular deps are not a problem if not about value
                        influenced_fields_value_change.add(mod["fieldId"])
            entity_modifications.append(
                {
                    "fieldId": entity["field"],
                    "influenced_fields": influenced_fields,
                    "influenced_fields_value_change": influenced_fields_value_change,
                }
            )
        return entity_modifications

    @staticmethod
    def _get_all_entities(
        collections: List[Dict[str, Any]],
    ) -> List[Any]:
        all_fields = []

        tab_entities: List[Any] = [
            el.get("entity") for el in collections if el.get("entity")
        ]
        all_entities = list(itertools.chain.from_iterable(tab_entities))

        for entity in all_entities:
            if entity["type"] == "oauth":
                for oauthType in entity["options"]["auth_type"]:
                    for oauthEntity in entity["options"][oauthType]:
                        all_fields.append(oauthEntity)
            else:
                all_fields.append(entity)

        return all_fields

    def _get_all_modification_data(
        self,
        collections: List[Dict[str, Any]],
    ) -> List[Any]:
        fields_with_mods: List[Any] = []
        all_modifications: List[Any] = []
        all_fields: List[str] = []

        entities = self._get_all_entities(collections)
        for entity in entities:
            all_fields.append(entity["field"])

            if "modifyFieldsOnValue" in entity:
                fields_with_mods.append(entity["field"])
                entity_mods = self._get_mods_data_for_single_entity(entity)
                all_modifications.extend(entity_mods)

        return [fields_with_mods, all_modifications, all_fields]

    def _validate_field_modifications(self) -> None:
        """
        Validates:
        * Circular dependencies
        * If fields try to modify itself
        * If fields try to modify field that do not exist
        """
        pages = self._config["pages"]

        if "configuration" in pages:
            configuration = pages["configuration"]
            tabs = configuration["tabs"]

            (
                fields_with_mods_config,
                all_modifications_config,
                all_fields_config,
            ) = self._get_all_modification_data(tabs)

            self._check_if_circular_modification(
                all_fields_config, fields_with_mods_config, all_modifications_config
            )

        if "inputs" in pages:
            inputs = pages["inputs"]
            services = inputs["services"]

            (
                fields_with_mods_inputs,
                all_modifications_inputs,
                all_fields_inputs,
            ) = self._get_all_modification_data(services)

            self._check_if_circular_modification(
                all_fields_inputs, fields_with_mods_inputs, all_modifications_inputs
            )

    def _validate_meta_default_view(self) -> None:
        default_view = self._global_config.meta.get("defaultView")
        if (
            default_view == "configuration"
            and not self._global_config.has_configuration()
        ):
            raise GlobalConfigValidatorException(
                'meta.defaultView == "configuration" but there is no configuration defined in globalConfig'
            )
        if default_view == "inputs" and not self._global_config.has_inputs():
            raise GlobalConfigValidatorException(
                'meta.defaultView == "inputs" but there is no inputs defined in globalConfig'
            )
        if default_view == "dashboard" and not self._global_config.has_dashboard():
            raise GlobalConfigValidatorException(
                'meta.defaultView == "dashboard" but there is no dashboard defined in globalConfig'
            )

    def _validate_custom_search_commands(self) -> None:
        for command in self._global_config.custom_search_commands:
            file_path = os.path.join(self._source_dir, "bin", command["fileName"])
            if not os.path.isfile(file_path):
                raise GlobalConfigValidatorException(
                    f"{command['fileName']} is not present in `{os.path.join(self._source_dir, 'bin')}` directory. "
                    "Please ensure the file exists."
                )

            if (command.get("requiredSearchAssistant", False) is False) and (
                command.get("description")
                or command.get("usage")
                or command.get("syntax")
            ):
                logger.warning(
                    "requiredSearchAssistant is set to false "
                    "but attributes required for 'searchbnf.conf' is defined which is not required."
                )
            if (command.get("requiredSearchAssistant", False) is True) and not (
                command.get("description")
                and command.get("usage")
                and command.get("syntax")
            ):
                raise GlobalConfigValidatorException(
                    "One of the attributes among `description`, `usage`, `syntax`"
                    " is not been defined in globalConfig. Define them as requiredSearchAssistant is set to True."
                )

            if command["commandName"] in SPLUNK_COMMANDS:
                raise GlobalConfigValidatorException(
                    f"CommandName: {command['commandName']}"
                    " cannot have the same name as Splunk built-in command."
                )

            fileName_without_extension = command["fileName"].replace(".py", "")
            if command["commandName"] == fileName_without_extension:
                # Here we are generating file based on commandName therefore
                # the core logic should not have the same name as commandName
                raise GlobalConfigValidatorException(
                    f"Filename: {fileName_without_extension} and CommandName: {command['commandName']}"
                    " should not be same for custom search command."
                )

    def validate(self) -> None:
        self._validate_config_against_schema()
        if self._global_config.has_pages():
            self._validate_configuration_tab_table_has_name_field()
            self._validate_custom_rest_handlers()
            self._validate_file_type_entity()
            self._validate_validators()
            self._validate_multilevel_menu()
            self._validate_duplicates()
            self._validate_panels()
            self._validate_checkbox_group()
            self._validate_groups()
            self._validate_field_modifications()
            self._validate_custom_search_commands()
        self._validate_alerts()
        self._validate_meta_default_view()


def should_warn_on_empty_validators(entity: Dict[str, Any]) -> bool:
    entity_type = entity.get("type")

    if entity_type in ENTITY_TYPES_WITHOUT_VALIDATORS:
        return False

    # special cases
    if entity_type == "oauth":
        return _should_warn_on_empty_validators_oauth(entity)

    elif entity_type == "checkboxGroup":
        return _should_warn_on_empty_validators_checkbox_group(entity)

    return "validators" not in entity


def _should_warn_on_empty_validators_checkbox_group(entity: Dict[str, Any]) -> bool:
    for row in entity.get("options", {}).get("rows", []):
        row_validators = row.get("input", {}).get("validators")

        if not row_validators:
            return True

    return "validators" not in entity


def _should_warn_on_empty_validators_oauth(entity: Dict[str, Any]) -> bool:
    options = entity.get("options", {})

    for auth_type in ("basic", "oauth"):
        for oauth_field in options.get(auth_type, []):
            if "validators" not in oauth_field:
                return True

    return False
