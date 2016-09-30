import pytest
import logging
from login.loginUI import SplunkUi
from splunktest.web.WebDriverTest import WebDriverTest
from pages import Services
from UIUtil import UIUtil
import conftest

CONFIG = pytest.config


class TestCreateServices(WebDriverTest):

    def setup_method(self, method):
        '''
        Setup method
         - login
        '''
        WebDriverTest.setup_method(self, method)

        self.logger = logging.getLogger('TestCreateServices')
        self.splunk = SplunkUi(self.browser)
        self.service_page = Services.ServicesPage(self.browser)
        self.module_ui_utils = UIUtil(self.logger)
        try:
            self.splunk.login(CONFIG.username, CONFIG.password)
            self.module_ui_utils.navigate_to_url(
                self.browser, 'app/itsi/services_lister')
        except Exception, err:
            self.browser.capture_screenshot()
            self.logger.error("setup_method failed: '%s'", err)

    def teardown_method(self, method):
        '''
        Teardown method
         - logout
         - shut down browser
        '''
        try:

            self.logger.debug("Logging out...")
            self.splunk.logout()
            self.browser.browser.delete_all_cookies()
            self.browser.quit()
            self.logger.debug("Logged out.")

        except Exception, err:
            self.browser.capture_screenshot()
            self.logger.error(" teardown_method failed: '%s'", err)

    def test_create_module_service(self):
        '''
        Test case for service creation

        The result is that a service is created with default pre-built kpis from os-da
        '''
        self.service_name = conftest.get_info_from_conf("service_name")
        if self.service_page.obj_created(self.service_name) is True:
            self.service_page.delete_selected_obj(self.service_name)

        self.service_page.create_single_service_from_module(serviceName=self.service_name, description="TEST")

        # go back to service page and verify the service is created
        # successfully
        self.module_ui_utils.navigate_to_url(
                self.browser, 'app/itsi/services_lister')
        assert self.service_page.obj_created(self.service_name) == True
