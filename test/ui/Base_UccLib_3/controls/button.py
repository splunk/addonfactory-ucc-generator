from ..components.base_component import BaseComponent
from selenium.webdriver.common.by import By

class Button(BaseComponent):
    """
    Entity_Component : Button
    """
    def __init__(self, browser, container):
        """
        :param browser: The selenium webdriver
        :param container: The locator of the container where the control is located in. 
        """
        super(Button, self).__init__(browser, container)

    def click(self):
        """
        Click on the button
        """
        self.container.click()
    
 
    # def __getattr__(self, key):
    #     """
    #     Button does not contain child elements. Hence, override the attribute method
    #     """
    #     try:
    #         element = self.elements[key]
    #         return self._get_element(element['by'], element['select'])
    #     except KeyError:
    #         raise
