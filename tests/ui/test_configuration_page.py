from pytest_splunk_addon_ui_smartx.base_test import UccTester
from tests.ui.pages.configuration_page import ConfigurationPage

import pytest
import copy

class TestConfigurationPage(UccTester):
    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.configuration
    def test_configuration_page_title_and_description(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """Verifies the title and description of the page"""
        configuration_page = ConfigurationPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        self.assert_util(configuration_page.title.wait_to_display, "Configuration")
        self.assert_util(configuration_page.description.wait_to_display, "Set up your add-on")
        
    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.configuration
    def test_openapi_json_download_button(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """Verifies the OpenAPI json download button"""
        configuration_page = ConfigurationPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        download_openapi_href=configuration_page.download_openapi.container.get_attribute("href")
        configuration_page.download_openapi.wait_to_be_clickable()
        self.assert_util("/en-GB/splunkd/__raw/servicesNS/nobody/Splunk_TA_UCCExample/static/openapi.json", download_openapi_href, operator="in")
