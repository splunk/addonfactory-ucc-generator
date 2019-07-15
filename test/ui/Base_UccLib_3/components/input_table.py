from table import Table
from selenium.webdriver.common.by import By
import time
from selenium.common import exceptions


class InputTable(Table):
    """
    Component: Input Table
    Input table has enable/disable, more-info views additionally to configuration table.
    """
    def __init__(self, browser, container, mapping={}):
        super(InputTable, self).__init__(browser, container, mapping)

        self.elements.update({
            "status": {
                "by": By.CSS_SELECTOR,
                "select": " .switch-label"
            },
            "switch_button_status": {
                "by": By.CSS_SELECTOR,
                "select": " td.col-disabled .disabled"
            },
            "status_toggle": {
                "by": By.CSS_SELECTOR,
                "select": " .switch-button .round"
            },
            "more_info": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " td.expands"
            },
            "more_info_row": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " tr.expanded + tr"
            },
            "more_info_key": {
                "by": By.CSS_SELECTOR,
                "select":  "dt"
            },
            "more_info_value": {
                "by": By.CSS_SELECTOR,
                "select":  "dd"
            },
            "input_list": {
                "by": By.CSS_SELECTOR,
                "select": ".dropdown-menu.open li a"
            },
            "switch_to_page": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " .pull-right li a"
            },
            "input_status":{
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " div.switch-label"
            }
        })


    def input_status_toggle(self, name, enable):
        # status = "enable" if enable else "disable"
        # negative_status = "disable" if enable else "enable"

        _row = self._get_row(name)
        input_status = _row.find_element(*self.elements["input_status"].values())
        # print _row.text.strip()
        # print input_status.text.strip()
        status = input_status.text.strip().lower()
        if enable:
            if status == "enabled":
                raise Exception("The input is already {}".format(input_status.text.strip()))
            elif status == "disabled":
                status_button = _row.find_element(*self.elements["status_toggle"].values())
                status_button.click()
                self.wait_until("switch_button_status")
                return True
        else:
            if status == "disabled":
                raise Exception("The input is already {}".format(input_status.text.strip()))
            elif input_status.text.strip().lower() == "enabled":
                status_button = _row.find_element(*self.elements["status_toggle"].values())
                status_button.click()
                self.wait_until("switch_button_status")
                return True
            

