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
import re
from typing import Any, Dict

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

    def _validate_file_type_entity(self) -> None:
        """
        Validates that file-based field has all necessary fields.
        Things should be provided in case of file field:
            * validators field
            * at least 1 validator (file validator)
            * only `json` is now supported in `supportedFileTypes` field
        """
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

    def _validate_string_validator(self, entity_field: str, validator: Dict[str, Any]):
        """
        Validates string validator. maxLength should be greater or equal
        than minLength.
        """
        if validator["maxLength"] < validator["minLength"]:
            raise GlobalConfigValidatorException(
                f"Entity '{entity_field}' has incorrect string validator, "
                f"'maxLength' should be greater or equal than 'minLength'."
            )

    def _validate_number_validator(self, entity_field: str, validator: Dict[str, Any]):
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

    def _validate_regex_validator(self, entity_field: str, validator: Dict[str, Any]):
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

    def _validate_entity_validators(self, entity: Dict[str, Any]):
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

    def _validate_validators(self):
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

    def validate(self) -> None:
        self._validate_config_against_schema()
        self._validate_configuration_tab_table_has_name_field()
        self._validate_custom_rest_handlers()
        self._validate_file_type_entity()
        self._validate_validators()
