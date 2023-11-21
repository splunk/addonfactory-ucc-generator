import pytest
from pytest_splunk_addon_ui_smartx.base_test import UccTester
from pytest_splunk_addon_ui_smartx.pages.proxy import Proxy

from tests.ui import constants as C

PROXY_URL = f"servicesNS/nobody/{C.ADDON_NAME}/{C.ADDON_NAME.lower()}_settings/proxy"


class TestProxyPage(UccTester):
    @pytest.mark.execute_enterprise_cloud_false
    @pytest.mark.forwarder
    @pytest.mark.proxy
    def test_proxy_misc(self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper):
        proxy = Proxy(
            C.ADDON_NAME,
            PROXY_URL,
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )

        # Labels
        self.assert_util(proxy.proxy_enable.get_input_label, "Enable")
        self.assert_util(proxy.type.get_input_label, "Proxy Type")
        self.assert_util(proxy.host.get_input_label, "Host")
        self.assert_util(proxy.port.get_input_label, "Port")
        self.assert_util(proxy.username.get_input_label, "Username")
        self.assert_util(proxy.password.get_input_label, "Password")
        self.assert_util(proxy.dns_enable.get_input_label, "Reverse DNS resolution")

        # Default values
        self.assert_util(proxy.proxy_enable.is_checked(), False)
        self.assert_util(proxy.type.get_value(), "http")
        self.assert_util(proxy.type.list_of_values(), ["http", "socks4", "socks5"])
        self.assert_util(proxy.host.get_value(), "")
        self.assert_util(proxy.port.get_value(), "")
        self.assert_util(proxy.username.get_value(), "")
        self.assert_util(proxy.password.get_value(), "")
        self.assert_util(proxy.dns_enable.is_checked(), False)

    @pytest.mark.execute_enterprise_cloud_false
    @pytest.mark.forwarder
    @pytest.mark.proxy
    def test_proxy_required_field_host(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        # Tests proxy.options.saveValidator
        proxy = Proxy(
            C.ADDON_NAME,
            PROXY_URL,
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        proxy.proxy_enable.check()
        proxy.type.select("http")
        proxy.port.set_value("655")
        proxy.username.set_value("test")
        proxy.password.set_value("test")
        self.assert_util(
            proxy.save, "Proxy Host can not be empty", left_args={"expect_error": True}
        )
        proxy.host.set_value("closeerror")
        self.assert_util(proxy.is_error_closed, True)

    @pytest.mark.execute_enterprise_cloud_false
    @pytest.mark.forwarder
    @pytest.mark.proxy
    def test_proxy_host_field_length_validation(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        proxy = Proxy(
            C.ADDON_NAME,
            PROXY_URL,
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        host_value = "a" * 4097
        proxy.host.set_value(host_value)
        self.assert_util(
            proxy.save,
            "Max host length is 4096",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_false
    @pytest.mark.forwarder
    @pytest.mark.proxy
    def test_proxy_required_field_port(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        # Tests proxy.options.saveValidator
        proxy = Proxy(
            C.ADDON_NAME,
            PROXY_URL,
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        proxy.proxy_enable.check()
        proxy.type.select("http")
        proxy.host.set_value("foobar")
        proxy.username.set_value("test")
        proxy.password.set_value("test")
        self.assert_util(
            proxy.save, "Proxy Port can not be empty", left_args={"expect_error": True}
        )

    @pytest.mark.execute_enterprise_cloud_false
    @pytest.mark.forwarder
    @pytest.mark.proxy
    def test_proxy_port_field_numeric_values(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        proxy = Proxy(
            C.ADDON_NAME,
            PROXY_URL,
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        proxy.host.set_value("foobar")
        proxy.port.set_value("test")
        self.assert_util(
            proxy.save,
            "Field Port is not a number",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_false
    @pytest.mark.forwarder
    @pytest.mark.proxy
    def test_proxy_port_field_valid_range(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        proxy = Proxy(
            C.ADDON_NAME,
            PROXY_URL,
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        proxy.host.set_value("foobar")
        proxy.port.set_value("0")
        self.assert_util(
            proxy.save,
            "Field Port should be within the range of [1 and 65535]",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_false
    @pytest.mark.forwarder
    @pytest.mark.proxy
    def test_proxy_encrypted_field_password(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        proxy = Proxy(
            C.ADDON_NAME,
            PROXY_URL,
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        mask_check = proxy.password.encrypted
        if mask_check:
            msg = "Password is masked"
        else:
            msg = "Password is not masked"
        self.assert_util(msg, "Password is masked")
        proxy.proxy_enable.check()
        proxy.type.select("http")
        proxy.host.set_value("foobar")
        proxy.port.set_value("655")
        proxy.username.set_value("test")
        proxy.password.set_value("test")
        assert proxy.save()
        self.assert_util(
            proxy.backend_conf_get.get_stanza().get("proxy_password"), "******"
        )

    @pytest.mark.execute_enterprise_cloud_false
    @pytest.mark.forwarder
    @pytest.mark.proxy
    def test_proxy_username_field_length_validation(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        proxy = Proxy(
            C.ADDON_NAME,
            PROXY_URL,
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        proxy.host.set_value("foobar")
        proxy.port.set_value("65535")
        proxy.username.set_value("a" * 51)
        self.assert_util(
            proxy.save,
            "Max length of username is 50",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_false
    @pytest.mark.forwarder
    @pytest.mark.proxy
    def test_proxy_password_field_length_validation(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        proxy = Proxy(
            C.ADDON_NAME,
            PROXY_URL,
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        proxy.host.set_value("foobar")
        proxy.port.set_value("65535")
        proxy.username.set_value("aaa")
        proxy.password.set_value("a" * 8193)
        self.assert_util(
            proxy.save,
            "Max length of password is 8192",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_false
    @pytest.mark.forwarder
    @pytest.mark.proxy
    @pytest.mark.sanity_test
    def test_proxy_frontend_backend_validation(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        proxy = Proxy(
            C.ADDON_NAME,
            PROXY_URL,
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        proxy.proxy_enable.check()
        proxy.type.select("socks4")
        proxy.host.set_value("foobar")
        proxy.port.set_value("655")
        proxy.username.set_value("test")
        proxy.password.set_value("test")
        proxy.dns_enable.check()
        assert proxy.save()
        self.assert_util(
            proxy.backend_conf_get.get_stanza(decrypt=True),
            {
                "disabled": False,
                "proxy_enabled": "1",
                "proxy_port": "655",
                "proxy_rdns": "1",
                "proxy_type": "socks4",
                "proxy_url": "foobar",
                "proxy_password": "test",
                "proxy_username": "test",
            },
        )

    @pytest.mark.execute_enterprise_cloud_false
    @pytest.mark.proxy
    @pytest.mark.forwarder
    def test_proxy_host_valid_input(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """
        Verification of host throwing error msg when containing special characters
        """
        proxy = Proxy(
            C.ADDON_NAME,
            PROXY_URL,
            ucc_smartx_selenium_helper=ucc_smartx_selenium_helper,
            ucc_smartx_rest_helper=ucc_smartx_rest_helper,
        )
        proxy.host.set_value("abc$$")
        self.assert_util(
            proxy.save,
            "Proxy Host should not have special characters",
            left_args={"expect_error": True},
        )
