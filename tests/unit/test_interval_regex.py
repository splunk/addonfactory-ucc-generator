import re
import pytest

from splunk_add_on_ucc_framework.entity.interval_entity import CRON_REGEX

cron_regex = re.compile(CRON_REGEX)


@pytest.mark.parametrize(
    "is_valid, expression",
    (
        (True, "* * * * *"),
        (True, "1 2 3 4 5"),
        (True, "5 0 * 8 *"),
        (True, "0 12 * * 3"),
        (True, "0 22 * * 1-5"),
        (True, "* 0,2 * * *"),
        (True, "* 0/9 * * *"),
        (True, "*/15 * * * *"),
        (True, "*/15 0 1,15 * 1-5"),
        (True, "0 0,12 1 */2 *"),
        (True, "1"),
        (True, "-1"),
        (True, "0"),
        (True, "6371"),
        (True, "* 0-20/2 * * *"),
        (True, "* 10-20/12 * * *"),
        (True, "* */9,8 * * *"),
        (True, "* */9,9-12 * * *"),
        (True, "* 0/9,8 * * *"),
        (True, "* 9/1,9-12 * * *"),
        (False, "-2"),
        (False, "5 0 * 8 * 1"),
        (False, "5 4 * * sun"),  # This syntax (sun) is not supported
        (False, "@weekly")  # This syntax is not supported
        # (False, "* 0/0 * * *")   # We don't handle this case
    ),
)
def test_cron_regex_expression(is_valid, expression):
    match = cron_regex.fullmatch(expression)
    assert bool(match) == is_valid
