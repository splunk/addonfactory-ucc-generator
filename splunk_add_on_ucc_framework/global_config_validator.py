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
    GlobalConfigValidator implements different validation for globalConfig.json.
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

    def validate(self) -> None:
        self._validate_config_against_schema()
        self._validate_configuration_tab_table_has_name_field()
