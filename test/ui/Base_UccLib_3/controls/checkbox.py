import time
from ..components.base_component import BaseComponent
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

class Checkbox(BaseComponent):


    def __init__(self, browser, container, searchable=True):
        super(Checkbox, self).__init__(browser, container)
        self.elements.update({
            "internal_container": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " div.select2-container"
            },
            "checkbox": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + ' .checkbox'
            },
            "checkbox_btn": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " .checkbox a.btn"
            },
            "checkbox_enabled": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + ' .checkbox a.btn .icon-check'
            }
        })

    
    def toggle(self):
        '''
        Toggles the checkbox value
        '''
        self.checkbox.click()

    def check(self):
        '''
        Checks the checkbox if unchecked
        '''
        try:
            if self.is_checked() == False:
                self.toggle()
            return True
        except:
            return "Checkbox is already checked"

    def uncheck(self):
        '''
        Unchecks the checkbox if checked
        '''
        try:
            if self.is_checked() == True:
                self.toggle()
            return True
        except:
            return "Checkbox is already unchecked"

    def is_checked(self):
        '''
        Returns True if the checkbox is already checked, otherwise False
        '''
        element = self.get_element("checkbox_enabled")
        a = element.value_of_css_property("display")
        if a =="inline-block":
            return True
        else:
            return False
    
