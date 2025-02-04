from typing import Any, Iterator, List

import pytest

from tests.ui.pages.account_page import AccountPage
from tests.ui.test_configuration_page_account_tab import _ACCOUNT_CONFIG
from pytest_splunk_addon_ui_smartx import utils as s_utils

from _pytest.assertion import truncate

truncate.DEFAULT_MAX_LINES = 9999
truncate.DEFAULT_MAX_CHARS = 9999


@pytest.fixture
def add_delete_account(ucc_smartx_rest_helper):
    account = AccountPage(
        ucc_smartx_rest_helper=ucc_smartx_rest_helper, open_page=False
    )
    url = account._get_account_endpoint()
    kwargs = _ACCOUNT_CONFIG
    yield account.backend_conf.post_stanza(url, kwargs)
    account.backend_conf.delete_all_stanzas()


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_call(item: pytest.Item) -> Iterator[Any]:
    """
    Implemented hook to:
    - check browser logs for severe logs after each test run.
    """

    yield

    # sometimes RUM is down and we get a lot of severe logs
    IGNORED: List[str] = [
        "https://rum-ingest.us1.signalfx.com",
        "https://cdn.signalfx.com/o11y-gdi-rum",
    ]

    browser_logs = s_utils.get_browser_logs(item.selenium_helper.browser)
    severe_logs = [
        log
        for log in browser_logs
        if log.level == s_utils.LogLevel.SEVERE
        and not any(ignored in log.message for ignored in IGNORED)
    ]

    if severe_logs:
        log_msg = [f"{log.level}: {log.source} - {log.message}" for log in severe_logs]
        msg = "Severe logs found in browser console logs: \n" + "\n".join(log_msg)
        pytest.fail(msg, pytrace=True)
