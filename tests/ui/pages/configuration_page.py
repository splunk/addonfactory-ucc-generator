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
        
class ConfigurationPage(Page):
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
        
        self.title = Message(
                ucc_smartx_selenium_helper.browser,
                Selector(select='[data-test="column"] .pageTitle'),
            )
        self.description = Message(
                ucc_smartx_selenium_helper.browser,
                Selector(select='[data-test="column"] .pageSubtitle'),
            )
        #self.tab_bar = 
        
    def open(self):
        """
        Open the required page. Page(super) class opens the page by default.
        """

        self.browser.get(
            f"{self.splunk_web_url}/en-US/app/{C.ADDON_NAME}"
        )
