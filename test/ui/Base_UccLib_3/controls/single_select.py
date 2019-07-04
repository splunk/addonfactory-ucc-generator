import time
from ..components.base_component import BaseComponent
from selenium.webdriver.common.by import By
# from selenium.webdriver.support.
from selenium.webdriver.common.keys import Keys

class SingleSelect(BaseComponent):
    """
    Entity-Component: SingleSelect
    Select Javascript framework: select2
    A dropdown which can select only one value
    """
    def __init__(self, browser, container, searchable=True):
        """
            :param browser: The selenium webdriver
            :param container: The locator of the container where the control is located in. 
        """

        super(SingleSelect, self).__init__(browser, container)
        self.searchable = searchable
        self.elements.update({
            "internal_container": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " div.select2-container"
            },
            "dropdown": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " .select2-choice"
            },
            "values": {
                "by": By.CSS_SELECTOR,
                "select": '.select2-drop-active[style*="display: block;"] .select2-result-selectable'
            },
            "cancel_selected": {
                "by": By.CSS_SELECTOR,
                "select": ' .select2-search-choice-close'
            }
            
            # To update
        })

        if searchable:
            self.elements.update({
                "input": {
                    "by": By.CSS_SELECTOR,
                    "select": '.select2-with-searchbox.select2-drop-active[style*="display: block;"] .select2-input'                
                }
            })

    def select(self, value, open_dropdown=True):
        if open_dropdown:
            self.dropdown.click()

        for each in self.get_elements('values'):
            if each.text.strip().lower() == value.lower():
                each.click()
                self.wait_for('internal_container')
                return True
        else:
            raise ValueError("{} not found in select list".format(value))


    def search(self, value):
        """
        search with the singleselect input
            :param value: string value to search
        """

        assert self.searchable, "Can not search, as the Singleselect is not searchable"
        self.dropdown.click()

        #DEBUG: maybe we have to click the select button
        self.input.send_keys(value)

    def search_get_list(self, value):
        """
        search with the singleselect input and return the list
            :param value: string value to search        
            :returns : list of values
        """

        self.search(value)
        time.sleep(1)
        searched_values = list(self._list_visible_values())
        self.input.send_keys(Keys.ESCAPE)
        self.wait_for("container")
        return searched_values

    def _list_visible_values(self):
        """
        Get list of values which are visible. Used while filtering 
        """
        for each in self.get_elements('values'):
            yield each.get_attribute('textContent')


    def get_value(self):
        """
        get the selected value
        """
        return self.dropdown.text

    def cancel_selected_value(self):
        try:
            self.cancel_selected.click()
            return True
        except:
            raise ValueError("No selected value")

    def list_of_values(self):
        """
        
        """
        selected_val = self.get_value()
        self.dropdown.click()
        first_element = None
        for each in self.get_elements('values'):
            if not first_element:
                first_element = each
            yield each.text
        if selected_val.strip():
            self.select(selected_val, open_dropdown=False)
        elif self.searchable:
            self.input.send_keys(Keys.ESCAPE)
        elif first_element:
            self.select(first_element.text, open_dropdown=False)
        self.wait_for("internal_container")


    
