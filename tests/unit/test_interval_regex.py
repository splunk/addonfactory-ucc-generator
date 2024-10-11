import re
import pytest

cron_regex = re.compile(
    r"^(?:-1|\d+(?:\.\d+)?|(((\d+,)+\d+|(\d+[/-]\d+)|\d+|\*(\/\d*)?) ?){5})$"
)


@pytest.mark.parametrize(
    "is_valid, expression",
    (
        (True, "* * * * *"),
        (True, "1 2 3 4 5"),
        (True, "5 0 * 8 *"),
        (True, "0 12 * * 3"),
        (True, "0 22 * * 1-5"),
        (True, "* 0,2 * * *"),
        (True, "*/15 * * * *"),
        (True, "*/15 0 1,15 * 1-5"),
        (True, "0 0,12 1 */2 *"),
        # (True, "* 0-20/2 * * *"), # 0-20/2 cron syntax is not supported by this regex...
        (True, "1"),
        (True, "-1"),
        (True, "0"),
        (True, "6371"),
        (False, "-2"),
        (False, "5 0 * 8 * 1"),
        (False, "5 4 * * sun"),  # This syntax (sun) is not supported
        (False, "@weekly"),  # This syntax is not supported
    ),
)
def test_cron_regex_expression(is_valid, expression):
    match = cron_regex.fullmatch(expression)
    assert bool(match) == is_valid
