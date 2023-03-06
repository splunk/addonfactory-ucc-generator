from pytest_splunk_addon_ui_smartx.components.base_component import Selector
from pytest_splunk_addon_ui_smartx.pages.page import Page
from pytest_splunk_addon_ui_smartx.backend_confs import ListBackendConf
from pytest_splunk_addon_ui_smartx.alert_actions import AlertEntity, ActionEntity
from pytest_splunk_addon_ui_smartx.alert_actions.components.textbox import AlertTextBox
from pytest_splunk_addon_ui_smartx.alert_actions.components.checkbox import (
    AlertCheckbox,
)
from pytest_splunk_addon_ui_smartx.alert_actions.components.single_select import (
    AlertSingleSelect,
)
from pytest_splunk_addon_ui_smartx.alert_actions.components.toggle import AlertToggle
from pytest_splunk_addon_ui_smartx.alert_actions.components.account_select import (
    AlertAccountSelect,
)
from pytest_splunk_addon_ui_smartx.alert_actions.components.table import AlertTable


from tests.ui import constants as C


class TestAction(ActionEntity):
    """
    Form to configure a new Input
    """

    def __init__(self, browser):
        """
        :param browser: The selenium webdriver
        """

        super().__init__(browser)

        # Controls
        self.name = AlertTextBox(
            browser, Selector(select="#test_alert_name"), use_child_input=True
        )
        self.all_incident = AlertCheckbox(
            browser, Selector(select="#test_alert_all_incidents")
        )
        self.table_list = AlertSingleSelect(
            browser, Selector(select="#test_alert_table_list")
        )
        self.action = AlertToggle(
            browser, Selector(select='input[name="action.test_alert.param.action"]')
        )
        self.account = AlertAccountSelect(
            browser, Selector(select="#test_alert_account")
        )


class AlertPage(Page):
    def __init__(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper, open_page=True
    ):
        super().__init__(ucc_smartx_selenium_helper, ucc_smartx_rest_helper, open_page)
        if ucc_smartx_selenium_helper:
            self.alert_table = AlertTable(ucc_smartx_selenium_helper.browser)
            self.alert_entity = AlertEntity(
                ucc_smartx_selenium_helper, ucc_smartx_rest_helper
            )
            self.action_entity = TestAction(ucc_smartx_selenium_helper.browser)
        if ucc_smartx_rest_helper:
            self.backend_conf = ListBackendConf(
                self._get_alert_endpoint(),
                ucc_smartx_rest_helper.username,
                ucc_smartx_rest_helper.password,
            )

    def open(self):
        """
        Abstract Method. Open the page
        """
        self.browser.get(
            f"{self.splunk_web_url}/en-US/manager/{C.ADDON_NAME}/saved/searches"
        )

    def _get_alert_endpoint(self):
        return f"{self.splunk_mgmt_url}/servicesNS/admin/{C.ADDON_NAME}/saved/searches/"
