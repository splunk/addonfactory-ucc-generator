import logging
import pytest

from splunkwebdriver.models.pages.search import BasePage
from splunkwebdriver.models.html_objects import Input
from splunkwebdriver.utils.reporting import htmllogging
from selenium.webdriver.common.by import By
from splunkwebdriver.models.pages import account

logger = logging.getLogger("Test-SplunkUI")


class SplunkUi(BasePage):

    '''
    Model that represents the Login Page
    '''

    def __init__(self, browser, *args, **kwargs):
        '''
        LoginPage Init

        @type browser: WebDriver
        @param browser: WebDriver instance of a Browser driver.
        '''
        super(SplunkUi, self).__init__(browser, *args, **kwargs)
        self.uri = '/account/login'
        self.objects = {
            "not_cloud_login": {'by': By.CSS_SELECTOR, 'value': '.account .account-login'}}
        self.account = account.Account(self.browser)
        self.account.account.login.username = Input.Input(
            self.browser, by=By.CSS_SELECTOR, value="input#username")
        self.account.account.login.password = Input.Input(
            self.browser, by=By.CSS_SELECTOR, value="input#password")
        self.browser = browser

    @htmllogging
    def open_login_page(self):
        '''
        Opens the login page and sets up the elements.
        '''
        self.browser.get(self.web_url)

    def login(self, username='admin', password='changeme', cloud_password='WhisperAdmin250', submit=True):

        try:
            USERNAME = pytest.config.username
            PASSWORD = pytest.config.password
            CLOUD_PASSWORD = pytest.config.cloud_password
        except AttributeError:
            USERNAME = username
            PASSWORD = password
            CLOUD_PASSWORD = cloud_password

        # Open the splunkweb URL.
        self.open()

        if self.browser.is_element_present(**self.objects['not_cloud_login']) and self.web_url.find('splunkcloud') == -1:
            '''
            This is not a Cloud Instance.
            '''

            self.account.login(
                username=USERNAME, password=PASSWORD, submit=True)
        else:
            '''
            This is a Cloud Instance.
            '''

            self.account.login(
                username=USERNAME, password=CLOUD_PASSWORD, submit=True)

    def logout(self):
        '''
        Log out of splunk
        '''
        msg = self.account.logout()
        return msg
