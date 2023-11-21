from pytest_splunk_addon_ui_smartx.pages.page import Page
from pytest_splunk_addon_ui_smartx.components.base_component import Selector
from pytest_splunk_addon_ui_smartx.components.controls.message import Message
from pytest_splunk_addon_ui_smartx.components.controls.button import Button

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
        self.download_openapi = Button(
            ucc_smartx_selenium_helper.browser,
            Selector(select='[data-test="downloadButton"]'),
        )

    def open(self):
        """
        Open the required page. Page(super) class opens the page by default.
        """

        self.browser.get(
            f"{self.splunk_web_url}/en-US/app/{C.ADDON_NAME}/configuration"
        )
