
from __future__ import absolute_import

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

    def generate_default(self):
        return self._kv_template.format(
            name=self._field.name,
            value=self._field.default or '',
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
