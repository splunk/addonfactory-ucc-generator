import pytest
from unittest import mock

from splunk_add_on_ucc_framework.commands.rest_builder.endpoint import base, field


NO_SPECIAL_FIELDS_EXPECTED_VALUE = """
fieldstest_name_rh = [
    field.RestField(
        'account',
        required=True,
        encrypted=False,
        default='default',
        validator=None
    )
]
modeltest_name_rh = RestModel(fieldstest_name_rh, name='test_addon')
"""


SPECIAL_FIELDS_EXPECTED_VALUE = """
special_fields = [
    field.RestField(
        'name',
        required=True,
        encrypted=False,
        default='default',
        validator=None
    )
]

fieldstest_name_rh = [
    field.RestField(
        'account',
        required=True,
        encrypted=False,
        default='default',
        validator=None
    )
]
modeltest_name_rh = RestModel(fieldstest_name_rh, name='test_addon', special_fields=special_fields)
"""


@pytest.mark.parametrize(
    "lines,expected",
    [
        (None, "    None"),
        (
            "\nmax_len=4096,\nmin_len=0,\n",
            "\n    max_len=4096,\n    min_len=0,\n",
        ),
        (
            "validator.String(\n    max_len=4096,\n    min_len=0,\n)",
            "    validator.String(\n        max_len=4096,\n        min_len=0,\n    )",
        ),
    ],
)
def test_indent(lines, expected):
    assert base.indent(lines) == expected


@mock.patch(
    "splunk_add_on_ucc_framework.commands.rest_builder.endpoint.base.RestEntityBuilder.name_rh",
    "test_name_rh",
)
def test_generate_rh_file_no_special_fields():
    tmp_field = field.RestFieldBuilder("account", True, False, "default", None)
    tmp_builder = base.RestEntityBuilder("test_addon", [tmp_field])
    result = tmp_builder.generate_rh()
    assert result == NO_SPECIAL_FIELDS_EXPECTED_VALUE


@mock.patch(
    "splunk_add_on_ucc_framework.commands.rest_builder.endpoint.base.RestEntityBuilder.name_rh",
    "test_name_rh",
)
def test_generate_rh_file_with_special_fields():
    tmp_field = field.RestFieldBuilder("account", True, False, "default", None)
    tmp_special_field = field.RestFieldBuilder("name", True, False, "default", None)
    tmp_builder = base.RestEntityBuilder("test_addon", [tmp_field], [tmp_special_field])
    result = tmp_builder.generate_rh()
    assert result == SPECIAL_FIELDS_EXPECTED_VALUE
