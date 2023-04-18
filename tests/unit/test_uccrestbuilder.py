import pytest

from splunk_add_on_ucc_framework.commands.rest_builder.endpoint import base


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
