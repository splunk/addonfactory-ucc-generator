import time
from ..components.base_component import BaseComponent
from selenium.webdriver.common.by import By


class Tab(BaseComponent):
    """
    Component: Tab
    To change the tab in configuration page
    """
    def __init__(self, browser, container={"by": By.CLASS_NAME, "select": "nav"}):
        """
            :param browser: The selenium webdriver
            :param container: Container in which the table is located. Of type dictionary: {"by":..., "select":...}
        """
        super(Tab, self).__init__(browser, container)
        self.elements.update({
            "tab": {
                "by": By.ID,
                "select": "{tab}-li"
            }
        })

    def open_tab(self, tab):
        """
        Open a specified tab
            :param tab: title of the tab
        """
        self.wait_for("container")
        tab_to_open = self._get_element(self.elements["tab"]['by'] , self.elements["tab"]['select'].format(tab=tab).strip())
        tab_to_open.click()

