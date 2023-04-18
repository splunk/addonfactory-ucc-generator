import pytest

from splunk_add_on_ucc_framework.commands.rest_builder.validator_builder import (
    ValidatorBuilder,
)
from tests.unit.helpers import get_testdata_file


@pytest.mark.parametrize(
    "config,expected_result",
    [
        (None, None),
        (
            [
                {
                    "type": "unknown_validator",
                    "unknown_argument": "some_value",
                }
            ],
            None,
        ),
        (
            [
                {
                    "type": "string",
                    "errorMsg": "Length of input name should be between 1 and 100",
                    "minLength": 1,
                    "maxLength": 100,
                }
            ],
            get_testdata_file("validator_builder_result_string"),
        ),
        (
            [
                {
                    "type": "regex",
                    "errorMsg": "Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",  # noqa: E501
                    "pattern": "^[a-zA-Z]\\w*$",
                },
            ],
            get_testdata_file("validator_builder_result_regex"),
        ),
        (
            [{"type": "number", "range": [1, 65535]}],
            get_testdata_file("validator_builder_result_number"),
        ),
        (
            [{"errorMsg": "Enter a valid Email Address.", "type": "email"}],
            get_testdata_file("validator_builder_result_email"),
        ),
        (
            [{"type": "ipv4"}],
            get_testdata_file("validator_builder_result_ipv4"),
        ),
        (
            [{"type": "date"}],
            get_testdata_file("validator_builder_result_date"),
        ),
        (
            [{"type": "url"}],
            get_testdata_file("validator_builder_result_url"),
        ),
        (
            [
                {
                    "type": "regex",
                    "errorMsg": "Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",  # noqa: E501
                    "pattern": "^[a-zA-Z]\\w*$",
                },
                {
                    "type": "string",
                    "errorMsg": "Length of input name should be between 1 and 100",
                    "minLength": 1,
                    "maxLength": 100,
                },
            ],
            get_testdata_file("validator_builder_result_string_regex"),
        ),
        (
            [
                {
                    "type": "regex",
                    "errorMsg": "Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",  # noqa: E501
                    "pattern": "^[a-zA-Z]\\w*$",
                },
                {
                    "type": "string",
                    "errorMsg": "Length of input name should be between 1 and 100",
                    "minLength": 1,
                    "maxLength": 100,
                },
                {
                    "type": "number",
                    "range": [1, 65535],
                },
                {
                    "errorMsg": "Enter a valid Email Address.",
                    "type": "email",
                },
                {
                    "type": "ipv4",
                },
                {
                    "type": "date",
                },
                {
                    "type": "url",
                },
            ],
            get_testdata_file("validator_builder_result_everything"),
        ),
    ],
)
def test_validator_builder(config, expected_result):
    assert expected_result == ValidatorBuilder().build(config)
