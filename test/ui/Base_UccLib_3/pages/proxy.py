
from ..components.tabs import Tab
from ..components.entity import Entity
from ..controls.single_select import SingleSelect
from ..components.entity import Entity
from ..controls.checkbox import Checkbox
from ..controls.button import Button
from ..controls.textbox import TextBox
from ..backend_confs import SingleBackendConf
from selenium.webdriver.common.by import By
import time


class Proxy(Entity):
    def __init__(self, browser, urls, session_key):
        """
            :param browser: The selenium webdriver
            :param urls: Splunk web & management url. {"web": , "mgmt": }
            :param session_key: session key to access the rest endpoints
        """
        entity_container = {"by": By.CSS_SELECTOR, "select": "#proxy-tab"}
        super(Proxy, self).__init__(browser, entity_container)
        self.web_url = urls["web"]
        self.mgmt_url = urls["mgmt"]
        self.open()


        # Controls
        self.host = TextBox(browser, {"by": By.NAME, "select": "proxy_url"})
        self.port = TextBox(browser, {"by": By.NAME, "select": "proxy_port"})
        self.username = TextBox(browser, {"by": By.NAME, "select": "proxy_username"})
        self.password = TextBox(browser, {"by": By.NAME, "select": "proxy_password"}, encrypted=True)
        self.proxy_enable = Checkbox(browser, {"by": By.CSS_SELECTOR, "select": " .proxy_enabled" })
        self.dns_enable = Checkbox(browser, {"by": By.CSS_SELECTOR, "select": " .proxy_rdns" })
        
        # Components
        self.type = SingleSelect(
            browser, {"by": By.CSS_SELECTOR, "select": ".proxy_type"})
       
        self.backend_conf = SingleBackendConf(self._get_proxy_endpoint(), session_key)

    def open(self):
        """
        Open the required page. Page(super) class opens the page by default.
        """
        self.browser.get(
            '{}/en-US/app/Splunk_TA_microsoft-cloudservices/configuration'.format(self.web_url))
        tab = Tab(self.browser)
        tab.open_tab("proxy")

    
    def _get_proxy_endpoint(self):
        """
        get rest endpoint for the configuration
        """
        return '{}/servicesNS/nobody/Splunk_TA_microsoft-cloudservices/configs/conf-splunk_ta_mscs_settings/proxy'.format(self.mgmt_url)
