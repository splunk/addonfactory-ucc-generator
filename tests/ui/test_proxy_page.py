import pytest
from pytest_splunk_addon_ui_smartx.base_test import UccTester
from pytest_splunk_addon_ui_smartx.pages.proxy import Proxy

from tests.ui import constants as C

PROXY_URL = (f"servicesNS/nobody/{C.ADDON_NAME}/{C.ADDON_NAME}_settings/proxy",)


class TestProxyPage(UccTester):
    @pytest.mark.proxy
    def test_proxy_default_configs(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        proxy = Proxy(
            C.ADDON_NAME,
            PROXY_URL,
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        self.assert_util(proxy.proxy_enable.is_checked(), False)
        self.assert_util(proxy.dns_enable.is_checked(), False)
        self.assert_util(proxy.type.get_value(), "http")
        self.assert_util(proxy.host.get_value(), "")
        self.assert_util(proxy.port.get_value(), "")
        self.assert_util(proxy.username.get_value(), "")
        self.assert_util(proxy.password.get_value(), "")
