import re
import urllib.request
import urllib.error
import pytest

from splunk_add_on_ucc_framework.const import SPLUNK_COMMANDS


@pytest.mark.skip(
    reason="Currently skipping the test case as the respective doc have been updated and current method "
    "is unable to fetch commands from it."
)
def test_command_list_up_to_date():
    url = "https://help.splunk.com/en/splunk-enterprise/search/spl-search-reference/10.0/search-commands"
    # passing an imitation of browser header to make this a request from web browser
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/115.0.0.0 Safari/537.36"
        )
    }

    req = urllib.request.Request(url, headers=headers)

    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode()

    search_commands = re.findall(
        r'splunk-enterprise/search/spl-search-reference/[^/]+/search-commands/([^"&]+)',
        content,
    )
    assert search_commands, "No search commands found on the Splunk documentation page"

    # These are the search commands for the serviceNow add-on. They are not present by default in Splunk instance
    not_global_commands = [
        "snowincidentstream",
        "snoweventstream",
        "snowincident",
        "snowevent",
        "3rd-party-custom-commands",
        "awssnsalert",
    ]
    for command in not_global_commands:
        search_commands.remove(command)

    assert set(search_commands) == set(SPLUNK_COMMANDS)
