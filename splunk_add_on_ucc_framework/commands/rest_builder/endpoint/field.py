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


from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.base import (
    indent,
    quote_string,
)


class RestFieldBuilder:

    _kv_template = "{name} = {value}"
    _rh_template = """field.RestField(
    {name},
    required={required},
    encrypted={encrypted},
    default={default},
    validator={validator}
)"""

    def __init__(self, name, required, encrypted, default, validator):
        self._name = name
        self._required = required
        self._encrypted = encrypted
        self._default = default
        self._validator = validator

    def generate_spec(self) -> str:
        return self._kv_template.format(
            name=self._name,
            value="",
        )

    def _indent_validator(self) -> str:
        validator = indent(self._validator)
        return validator[4:]

    def generate_rh(self) -> str:
        return self._rh_template.format(
            name=quote_string(self._name),
            required=self._required,
            encrypted=self._encrypted,
            default=quote_string(self._default),
            validator=self._indent_validator(),
        )
