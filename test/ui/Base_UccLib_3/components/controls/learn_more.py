from ..base_component import BaseComponent
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
        '''
        Redirects the browser object to the link provided by the container and returns the URL
        '''
        self.container.click()
        time.sleep(10)
        if self.browser.name == "Safari":
            self.browser.switch_to.window(self.browser.window_handles[0])
        else:
            self.browser.switch_to.window(self.browser.window_handles[1])
        return self.browser.current_url