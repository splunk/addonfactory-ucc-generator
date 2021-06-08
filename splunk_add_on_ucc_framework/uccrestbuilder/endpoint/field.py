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



from builtins import object
from .base import quote_string, indent


class RestFieldBuilder(object):

    _kv_template = '{name} = {value}'
    _rh_template = """field.RestField(
    {name},
    required={required},
    encrypted={encrypted},
    default={default},
    validator={validator}
)"""

    def __init__(self, field, validator):
        self._field = field
        self._validator = validator

    def generate_spec(self):
        return self._kv_template.format(
            name=self._field.name,
            value='',
        )

    def _indent_validator(self):
        validator = indent(self._validator)
        return validator[4:]

    def generate_rh(self):
        return self._rh_template.format(
            name=quote_string(self._field.name),
            required=self._field.required,
            encrypted=self._field.encrypted,
            default=quote_string(self._field.default),
            validator=self._indent_validator(),
        )
