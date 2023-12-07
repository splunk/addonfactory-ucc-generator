import pytest

from tests.ui.pages.account_page import AccountPage
from tests.ui.test_configuration_page_account_tab import ACCOUNT_CONFIG


@pytest.fixture
def add_delete_account(ucc_smartx_rest_helper):
    account = AccountPage(
        ucc_smartx_rest_helper=ucc_smartx_rest_helper, open_page=False
    )
    url = account._get_account_endpoint()
    kwargs = ACCOUNT_CONFIG
    yield account.backend_conf.post_stanza(url, kwargs)
    account.backend_conf.delete_all_stanzas()
