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

import json
import os

import jsonschema


class GlobalConfigValidatorException(Exception):
    pass


class GlobalConfigValidator:
    """
    GlobalConfigValidator implements different validation for globalConfig file.
    Simple validation should go to JSON schema in
    https://github.com/splunk/addonfactory-ucc-base-ui repository.
    Custom validation should be implemented here.
    """

    def __init__(self, source_dir: str, config: dict):
        self._source_dir = source_dir
        self._config = config

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

    def _validate_file_input_configuration(self) -> None:
        pages = self._config["pages"]
        configuration = pages["configuration"]
        tabs = configuration["tabs"]
        for tab in tabs:
            entities = tab["entity"]
            for entity in entities:
                if entity["type"] == "file":
                    validators = entity.get("validators")
                    if validators is None:
                        raise GlobalConfigValidatorException(
                            f"File validator should be present for "
                            f"'{entity['field']}' field."
                        )
                    for validator in validators:
                        if validator.get("type") == "file":
                            supported_file_types = validator.get("supportedFileTypes")
                            if supported_file_types is None:
                                raise GlobalConfigValidatorException(
                                    f"`json` should be present in the "
                                    f"'supportedFileTypes' for "
                                    f"'{entity['field']}' field."
                                )
                            if supported_file_types[0] != "json":
                                raise GlobalConfigValidatorException(
                                    f"`json` is only currently supported for "
                                    f"file input for '{entity['field']}' field."
                                )

    @staticmethod
    def _find_duplicates_in_list(_list) -> list:
        dup = [x for x in _list if _list.count(x) > 1]
        return dup if dup else False

    def _validate_autoCompleteFields_duplicates(self, options) -> None:
        labels, values = [], []
        for field in options["autoCompleteFields"]:
            labels.append(field["label"])
            values.append(field["value"])
        if self._find_duplicates_in_list(values) or self._find_duplicates_in_list(labels):
            raise GlobalConfigValidatorException(
                f"`Duplicates found for autoCompleteFields: {options['autoCompleteFields']}"
            )

    def _validate_entity_duplicates(self, entity) -> None:
        fields, labels = [], []
        for _entity in entity:
            fields.append(_entity['field'])
            labels.append(_entity['label'])
            temp = _entity.get("options")
            if temp and temp.get("autoCompleteFields"):
                self._validate_autoCompleteFields_duplicates(_entity["options"])
        if self._find_duplicates_in_list(fields) or self._find_duplicates_in_list(labels):
            raise GlobalConfigValidatorException(
                f"`Duplicates found for entity: {entity}"
            )

    def _validate_tabs_duplicates(self, tabs) -> None:
        names, titles = [], []
        for tab in tabs:
            names.append(tab['name'])
            titles.append(tab['title'])

            self._validate_entity_duplicates(tab['entity'])
        if self._find_duplicates_in_list(names) or self._find_duplicates_in_list(titles):
            raise GlobalConfigValidatorException(
                f"`Duplicates found for tabs: {tabs}"
            )

    def _validate_inputs_duplicates(self, inputs) -> None:
        names, titles = [], []
        for service in inputs['services']:
            names.append(service['name'])
            titles.append(service['title'])

            self._validate_entity_duplicates(service['entity'])

        if self._find_duplicates_in_list(names) or self._find_duplicates_in_list(titles):
            raise GlobalConfigValidatorException(
                f"`Duplicates found for inputs: {inputs}"
            )

    def _validate_duplicates(self) -> None:
        pages = self._config.get("pages")

        self._validate_tabs_duplicates(pages['configuration']['tabs'])

        inputs = pages.get("inputs")
        if inputs:
            self._validate_inputs_duplicates(inputs)

    def validate(self) -> None:
        self._validate_config_against_schema()
        self._validate_configuration_tab_table_has_name_field()
        self._validate_custom_rest_handlers()
        self._validate_file_input_configuration()
        self._validate_duplicates()
