from ..components.base_component import BaseComponent
from selenium.webdriver.common.by import By

class Toggle(BaseComponent):
    """
    Entity_Component : Button
    """
    def __init__(self, browser, container):
        """
        :param browser: The selenium webdriver
        :param container: The locator of the container where the control is located in. 
        """
        super(Toggle, self).__init__(browser, container)
        self.elements.update({
        "toggle_btn": {
            "by": By.CSS_SELECTOR,
            "select": container["select"] + " .btn"
        },
        "selected": {
            "by": By.CSS_SELECTOR,
            "select": container["select"] + " .active"
        }
    })


    def select(self, value):
        for each in self.get_elements('toggle_btn'):
            if each.text.strip().lower() == value.lower():
                each.click()
                return True
        else:
            raise ValueError("{} not found".format(value))
        return True
    
    def get_value(self):
        return self.selected.text.strip()