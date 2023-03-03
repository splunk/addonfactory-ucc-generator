from pytest_splunk_addon_ui_smartx.components.base_component import Selector
from pytest_splunk_addon_ui_smartx.components.tabs import Tab
from pytest_splunk_addon_ui_smartx.components.entity import Entity
from pytest_splunk_addon_ui_smartx.components.controls.textbox import TextBox
from pytest_splunk_addon_ui_smartx.components.controls.toggle import Toggle
from pytest_splunk_addon_ui_smartx.components.controls.multi_select import MultiSelect
from pytest_splunk_addon_ui_smartx.components.controls.learn_more import LearnMore
from pytest_splunk_addon_ui_smartx.backend_confs import SingleBackendConf


class CustomPage(Entity):
    def __init__(
        self,
        ucc_smartx_selenium_helper=None,
        ucc_smartx_rest_helper=None,
    ):
        """
        :param ucc_smartx_selenium_helper: fixture contains browser, urls and session key
        """
        entity_container = Selector(select='div[id="custom_tabTab"]')

        # Components
        if ucc_smartx_selenium_helper:
            super().__init__(ucc_smartx_selenium_helper.browser, entity_container)
            self.splunk_web_url = ucc_smartx_selenium_helper.splunk_web_url
            self.open()
            self.test_string = TextBox(
                ucc_smartx_selenium_helper.browser,
                Selector(select='[data-test="control-group"][data-name="test_string"]'),
            )
            self.test_number = TextBox(
                ucc_smartx_selenium_helper.browser,
                Selector(select='[data-test="control-group"][data-name="test_number"]'),
            )
            self.test_regex = TextBox(
                ucc_smartx_selenium_helper.browser,
                Selector(select='[data-test="control-group"][data-name="test_regex"]'),
            )
            self.test_email = TextBox(
                ucc_smartx_selenium_helper.browser,
                Selector(select='[data-test="control-group"][data-name="test_email"]'),
            )
            self.test_ipv4 = TextBox(
                ucc_smartx_selenium_helper.browser,
                Selector(select='[data-test="control-group"][data-name="test_ipv4"]'),
            )
            self.test_date = TextBox(
                ucc_smartx_selenium_helper.browser,
                Selector(select='[data-test="control-group"][data-name="test_date"]'),
            )
            self.test_url = TextBox(
                ucc_smartx_selenium_helper.browser,
                Selector(select='[data-test="control-group"][data-name="test_url"]'),
            )
            self.test_radio = Toggle(
                ucc_smartx_selenium_helper.browser,
                Selector(select='[data-test="control-group"][data-name="test_radio"]'),
            )
            self.test_multiselect = MultiSelect(
                ucc_smartx_selenium_helper.browser,
                Selector(
                    select='[data-test="control-group"][data-name="test_multiselect"]'
                ),
            )
            self.test_help_link = LearnMore(
                ucc_smartx_selenium_helper.browser,
                Selector(
                    select='[data-test="control-group"][data-name="test_help_link"]'
                ),
            )

        if ucc_smartx_rest_helper:
            self.splunk_mgmt_url = ucc_smartx_rest_helper.splunk_mgmt_url
            self.backend_conf = SingleBackendConf(
                self._get_custom_url(),
                ucc_smartx_rest_helper.username,
                ucc_smartx_rest_helper.password,
            )

    def open(self):
        """
        Open the required page. Page(super) class opens the page by default.
        """
        self.browser.get(
            "{}/en-US/app/Splunk_TA_UCCExample/configuration".format(
                self.splunk_web_url
            )
        )
        tab = Tab(self.browser)
        tab.open_tab("custom_abc")

    def _get_custom_url(self):
        """
        get rest endpoint for the configuration
        """
        return "{}/servicesNS/nobody/Splunk_TA_UCCExample/configs/conf-splunk_ta_uccexample_settings/custom_tab".format(
            self.splunk_mgmt_url
        )
