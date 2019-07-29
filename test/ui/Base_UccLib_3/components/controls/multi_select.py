import time
from ..base_component import BaseComponent
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

class MultiSelect(BaseComponent):
    """
    Entity-Component: Multiselect
    Select Javascript framework: select2
    A dropdown which can select more than one values
    """
    def __init__(self, browser, container):
        """
            :param browser: The selenium webdriver
            :param container: The locator of the container where the control is located in
        """
        super(MultiSelect, self).__init__(browser, container)

        self.elements.update({
            "internal_container": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " div.select2-container"
            },
            "dropdown": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " .select2-choices"
            },
            "selected": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " .select2-search-choice"
            },
            "deselect": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " .select2-search-choice a"
            },
            "input": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] +  " .select2-input"                
            },
            "hidden_values": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " .select2-offscreen option"                
            },
            "values": {
                "by": By.CSS_SELECTOR,
                "select": '.select2-drop-active[style*="display: block;"] li.select2-result-selectable'
            }
        })

    def search(self, value):
        """
        search with the multiselect input
            :param value: string value to search
        """
        self.input.send_keys(value)

    def search_get_list(self, value):
        """
        search with the multiselect input and return the list
            :param value: string value to search        
            :returns : list of values
        """
        self.search(value)
        searched_values = list(self._list_visible_values())
        self.input.send_keys(Keys.ESCAPE)
        self.wait_for("container")
        return searched_values

    def select(self, value):
        """
        select a single value
            :param value: the value to select
        """
        try:
            self.input.click()
        except:
            raise Exception("dropdown not found")

        for each in self.get_elements('values'):
            if each.text.strip().lower() == value.lower():
                each.click()
                self.wait_for("input")
                return True
        else:
            raise ValueError("{} not found in select list".format(value))

    def deselect(self, value):
        """
        Remove an item from selected list.
        :param value: the value to deselect
        """
        for each in self.get_child_elements('selected'):
            if each.text.strip().lower() == value.lower():
                each.find_element(*self.elements["deselect"].values()).click()
                self.wait_for("internal_container")
                return True
        else:
            raise ValueError("{} not found in select list".format(value))

    def get_values(self):
        """
        get list selected values
        """
        return [each.text.strip() for each in self.get_child_elements("selected")]

    def list_of_values(self):
        """
        Get list of possible values to select from dropdown
        """
        self.wait_for("internal_container")
        for each in self.get_child_elements('hidden_values'):
            yield each.get_attribute('textContent')

    def _list_visible_values(self):
        """
        Get list of values which are visible. Used while filtering 
        """
        for each in self.get_elements('values'):
            yield each.get_attribute('textContent')

    
