from ..components.base_component import BaseComponent
from selenium.webdriver.common.by import By
import time

class LearnMore(BaseComponent):
    """
    Entity_Component : Learn More
    """
    def __init__(self, browser, container):
        """
        :param browser: The selenium webdriver
        :param container: The locator of the container where the control is located in. 
        """
        super(LearnMore, self).__init__(browser, container)

    def go_to_link(self):
        self.container.click()
        time.sleep(20)
        window_after = self.browser.window_handles[1]
        self.browser.switch_to.window(window_after)
        time.sleep(20)
        return self.browser.current_url