import re
import urllib.request

from splunk_add_on_ucc_framework.const import SPLUNK_COMMANDS


def test_command_list_up_to_date():
    with urllib.request.urlopen(
        "https://docs.splunk.com/Documentation/Splunk/latest/SearchReference"
    ) as resp:
        content = resp.read().decode()

    match = re.search(r"Search\s+Commands.+?<ul.+?>(.+?)</ul>", content, re.S)
    if match:
        search_commands_ul = match.group(1)
        search_commands = re.findall(
            r"<li[^>]*>.*?<a[^>]*>\s*([^\s<]+)\s+?</a>", search_commands_ul, re.S
        )
    else:
        search_commands_ul = None
        search_commands = []

    # These are the search commands for the serviceNow add-on. They are not present by default in Splunk instance
    not_global_commands = [
        "snowincidentstream",
        "snoweventstream",
        "snowincident",
        "snowevent",
    ]
    for command in not_global_commands:
        search_commands.remove(command)

    assert set(search_commands) == set(SPLUNK_COMMANDS)
