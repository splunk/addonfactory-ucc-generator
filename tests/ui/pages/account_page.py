from pytest_splunk_addon_ui_smartx.pages.page import Page
from pytest_splunk_addon_ui_smartx.components.base_component import Selector
from pytest_splunk_addon_ui_smartx.components.base_component import BaseComponent
from pytest_splunk_addon_ui_smartx.components.tabs import Tab
from pytest_splunk_addon_ui_smartx.components.entity import Entity
from pytest_splunk_addon_ui_smartx.components.controls.button import Button
from pytest_splunk_addon_ui_smartx.components.controls.single_select import SingleSelect
from pytest_splunk_addon_ui_smartx.components.controls.oauth_select import OAuthSelect
from pytest_splunk_addon_ui_smartx.components.controls.multi_select import MultiSelect
from pytest_splunk_addon_ui_smartx.components.controls.checkbox import Checkbox
from pytest_splunk_addon_ui_smartx.components.controls.textbox import TextBox
from pytest_splunk_addon_ui_smartx.components.controls.learn_more import LearnMore
from pytest_splunk_addon_ui_smartx.components.controls.toggle import Toggle
from pytest_splunk_addon_ui_smartx.components.controls.message import Message
from pytest_splunk_addon_ui_smartx.components.conf_table import ConfigurationTable
from pytest_splunk_addon_ui_smartx.backend_confs import ListBackendConf

from tests.ui import constants as C


class AccountEntity(Entity):
    def __init__(self, browser, container):
        """
        :param browser: The selenium webdriver
        :param container: The container in which the entity is located in
        """
        add_btn = Button(
            browser,
            Selector(
                select=container.select + ' button[data-test="button"][label="Add"]'
            ),
        )
        entity_container = Selector(select='[data-test="modal"]')

        super().__init__(browser, entity_container, add_btn=add_btn)

        # Controls
        self.name = TextBox(
            browser, Selector(select='[data-test="control-group"][data-name="name"]')
        )
        self.environment = SingleSelect(
            browser,
            Selector(select='[data-test="control-group"][data-name="custom_endpoint"]'),
            False,
        )
        self.account_radio = Toggle(
            browser,
            Selector(select='[data-test="control-group"][data-name="account_radio"]'),
        )
        self.example_checkbox = Checkbox(
            browser,
            Selector(
                select='[data-test="control-group"][data-name="account_checkbox"]'
            ),
        )
        self.multiple_select = MultiSelect(
            browser,
            Selector(
                select='[data-test="control-group"][data-name="account_multiple_select"]'
            ),
        )
        self.auth_key = OAuthSelect(
            browser,
            Selector(select='[data-test="control-group"][data-name="auth_type"]'),
        )
        self.username = TextBox(
            browser,
            Selector(select='[data-test="control-group"][data-name="username"]'),
        )
        self.password = TextBox(
            browser,
            Selector(select='[data-test="control-group"][data-name="password"]'),
        )
        self.security_token = TextBox(
            browser, Selector(select='[data-test="control-group"][data-name="token"]')
        )
        self.client_id = TextBox(
            browser,
            Selector(select='[data-test="control-group"][data-name="client_id"]'),
        )
        self.client_secret = TextBox(
            browser,
            Selector(select='[data-test="control-group"][data-name="client_secret"]'),
        )
        self.redirect_url = TextBox(
            browser,
            Selector(select='[data-test="control-group"][data-name="redirect_url"]'),
        )
        self.search_query = TextBox(
            browser, Selector(select='[data-test="textbox"][role="textbox"]')
        )
        self.help_link = LearnMore(
            browser,
            Selector(
                select=entity_container.select
                + ' [data-test="control-group"][data-name="example_help_link"]'
            ),
        )
        self.title = BaseComponent(browser, Selector(select='[data-test="title"]'))


class AccountPage(Page):
    """
    Page: Server page
    """

    def __init__(
        self,
        ucc_smartx_selenium_helper=None,
        ucc_smartx_rest_helper=None,
        open_page=True,
    ):
        """
        :param ucc_smartx_selenium_helper: smartx configuration fixture
        """
        super().__init__(ucc_smartx_selenium_helper, ucc_smartx_rest_helper, open_page)
        account_container = Selector(select='div[id="accountTab"]')

        if ucc_smartx_selenium_helper:
            self.title = Message(
                ucc_smartx_selenium_helper.browser,
                Selector(select='[data-test="column"] .pageTitle'),
            )
            self.description = Message(
                ucc_smartx_selenium_helper.browser,
                Selector(select='[data-test="column"] .pageSubtitle'),
            )
            self.table = ConfigurationTable(
                ucc_smartx_selenium_helper.browser, account_container
            )
            self.entity = AccountEntity(
                ucc_smartx_selenium_helper.browser, account_container
            )

        if ucc_smartx_rest_helper:
            self.backend_conf = ListBackendConf(
                self._get_account_endpoint(),
                ucc_smartx_rest_helper.username,
                ucc_smartx_rest_helper.password,
            )

    def open(self):
        """
        Open the required page. Page(super) class opens the page by default.
        """

        self.browser.get(
            f"{self.splunk_web_url}/en-US/app/{C.ADDON_NAME}/configuration"
        )
        tab = Tab(self.browser)
        tab.open_tab("account")

    def _get_account_endpoint(self):
        """
        Get rest endpoint for the configuration
        """
        return f"{self.splunk_mgmt_url}/servicesNS/nobody/{C.ADDON_NAME}/splunk_ta_uccexample_account"
