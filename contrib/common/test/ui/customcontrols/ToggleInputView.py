from selenium.webdriver.common.by  import By
from splunkwebdriver.models.splunkjs import mvc
from splunkwebdriver.models.html_objects import Button

class ToggleInputView(mvc.BaseChoiceView):
    def __init__(self, browser, by=By.CLASS_NAME, value='ToggleInputView', parent_instance=None):

        super(ToggleInputView, self).__init__(browser=browser, by=by, value=value, parent_instance=parent_instance)    
                    
        self.toggler_button = Button.Button(browser, By.CLASS_NAME, 'toggler-btn',parent_instance=self)
    
    def is_open(self):
        '''
        Find if the drop-down is open.
        '''
        element = self.find_element(By.CSS_SELECTOR, ".ToggleInputView .dropdown-menu")
        return element.is_displayed() == True
    
    def open(self):
        '''
        Open the drop-down.
        '''
        if not self.is_open():
            self.toggler_button.click()
    
    def close(self):
        '''
        Close the drop-down.
        '''
        if self.is_open():
            self.toggler_button.click()
        
    def select(self,value):
        '''
        Select a value from the drop-down.
        '''
        self.open()
        elements = {item.text:item for item in self.find_elements(By.CSS_SELECTOR, ".ToggleInputView .dropdown-menu li a")}
        elements[value].click()
    
    def get_selected_option(self):
        '''
        Get the currently selected option.
        '''
        return self.find_element(By.CSS_SELECTOR, ".ToggleInputView .toggler-btn .selected-item").text
    
    def get_options(self):
        '''
        Get all the options in the drop-down.
        '''
        self.open()
        elements = {item.text:item for item in self.find_elements(By.CSS_SELECTOR, ".ToggleInputView .dropdown-menu li")}
        self.close()
        return elements.keys()