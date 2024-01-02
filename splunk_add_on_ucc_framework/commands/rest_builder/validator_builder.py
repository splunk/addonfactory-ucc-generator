#
# Copyright 2024 Splunk Inc.
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
from typing import Any, Dict, Optional, Sequence

from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.base import (
    indent,
)


def quote_regex(value: Optional[str]) -> str:
    return '"""%s"""' % value


class BaseValidator:
    _validation_template = """validator.{class_name}({arguments})"""

    def _get_class_name(self) -> str:
        raise NotImplementedError()

    def _get_arguments(self, config: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError()

    def _format_arguments(self, **kwargs: Dict[str, Any]) -> str:
        args = list(
            map(
                lambda k_v: f"{k_v[0]}={k_v[1]}, ",
                list(kwargs.items()),
            )
        )
        args.insert(0, "")
        args.append("")
        return indent("\n".join(args))

    def build(self, config: Dict[str, Any]) -> str:
        return self._validation_template.format(
            class_name=self._get_class_name(),
            arguments=self._format_arguments(**self._get_arguments(config)),
        )


class StringValidator(BaseValidator):
    def _get_class_name(self) -> str:
        return "String"

    def _get_arguments(self, config: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "max_len": config.get("maxLength"),
            "min_len": config.get("minLength"),
        }


class NumberValidator(BaseValidator):
    def _get_class_name(self) -> str:
        return "Number"

    def _get_arguments(self, config: Dict[str, Any]) -> Dict[str, Any]:
        ranges = config.get("range", [None, None])
        return {
            "max_val": ranges[1],
            "min_val": ranges[0],
        }


class RegexValidator(BaseValidator):
    def _get_class_name(self) -> str:
        return "Pattern"

    def _get_arguments(self, config: Dict[str, Any]) -> Dict[str, Any]:
        return {"regex": "r" + quote_regex(config.get("pattern"))}


class EmailValidator(BaseValidator):
    def _get_class_name(self) -> str:
        return "Pattern"

    def _get_arguments(self, config: Dict[str, Any]) -> Dict[str, Any]:
        regex = (
            r"^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}"
            r"[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
        )
        return {"regex": "r" + quote_regex(regex)}


class Ipv4Validator(BaseValidator):
    def _get_class_name(self) -> str:
        return "Pattern"

    def _get_arguments(self, config: Dict[str, Any]) -> Dict[str, Any]:
        regex = r"^(?:(?:[0-1]?\d{1,2}|2[0-4]\d|25[0-5])(?:\.|$)){4}$"
        return {"regex": "r" + quote_regex(regex)}


class DateValidator(BaseValidator):
    def _get_class_name(self) -> str:
        return "Pattern"

    def _get_arguments(self, config: Dict[str, Any]) -> Dict[str, Any]:
        # iso8601 date time format
        regex = (
            r"^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))"
            r"(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$"
        )
        return {"regex": "r" + quote_regex(regex)}


class UrlValidator(BaseValidator):
    def _get_class_name(self) -> str:
        return "Pattern"

    def _get_arguments(self, config: Dict[str, Any]) -> Dict[str, Any]:
        regex = (
            r"^(?:(?:https?|ftp|opc\.tcp):\/\/)?(?:\S+(?::\S*)?@)?"
            r"(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])"
            r"(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}"
            r"(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|"
            r"(?:(?:[a-z\u00a1-\uffff0-9]+-?_?)*[a-z\u00a1-\uffff0-9]+)"
            r"(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*"
            r"(?:\.(?:[a-z\u00a1-\uffff]{2,}))?)(?::\d{2,5})?(?:\/[^\s]*)?$"
        )
        return {"regex": "r" + quote_regex(regex)}


class ValidatorBuilder:
    _validation_config_map = {
        "string": StringValidator,
        "number": NumberValidator,
        "regex": RegexValidator,
        "email": EmailValidator,
        "ipv4": Ipv4Validator,
        "date": DateValidator,
        "url": UrlValidator,
        # file validator does not need any generated code, everything is
        # validated in the UI
    }

    def _format_multiple_validators(self, validators: Sequence[str]) -> str:
        validators_str = ", \n".join(validators)
        return """validator.AllOf(\n{validators}\n)""".format(
            validators=indent(validators_str),
        )

    def build(self, configs: Optional[Sequence[Dict[str, Any]]]) -> Optional[str]:
        if configs is None:
            return None
        generated_validators = []
        for config in configs:
            # `config` variable should always have `type` field according to
            # the schema.
            config_type: str = config.get("type", "")
            validator = self._validation_config_map.get(config_type)
            if validator is None:
                continue
            generated_validators.append(validator().build(config))
        if not generated_validators:
            return None
        if len(generated_validators) > 1:
            return self._format_multiple_validators(generated_validators)
        return generated_validators[0]
