from ..components.base_component import BaseComponent
from dropdown import Dropdown
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import re
import time
from selenium.common import exceptions

class Table(BaseComponent):
    """
    Component: Table
    Base class of Input & Configuration table
    """
    def __init__(self, browser, container, mapping=dict(),wait_for_seconds = 10):
        """
            :param browser: The selenium webdriver
            :param container: Container in which the table is located. Of type dictionary: {"by":..., "select":...}
            :param mapping= If the table headers are different from it's html-label, provide the mapping as dictionary. For ex, {"Status": "disabled"}
        """
        
        super(Table, self).__init__(browser, container)
        self.header_mapping = mapping
        
        self.elements.update({
            "rows": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " tr.apps-table-tablerow"
            },
            "header": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " th"
            },
            "app_listings": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " tbody.app-listings"
            },
            "action_values": {
                "by": By.CSS_SELECTOR,
                "select":container["select"] + " td.col-actions a"
            },
            "col": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " td.col-{column}"
            },
            "col-number": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " td:nth-child({col_number})"
            },
            "edit": {
                "by": By.CSS_SELECTOR,
                "select": "a.edit"
            },
            "clone": {
                "by": By.CSS_SELECTOR,
                "select": "a.clone"
            },
            "delete": {
                "by": By.CSS_SELECTOR,
                "select": "a.delete"
            },
            "delete_prompt": {
                "by": By.CSS_SELECTOR,
                "select": ".modal-dialog div.delete-prompt"
            },
            "delete_btn": {
                "by": By.CSS_SELECTOR,
                "select": ".modal-dialog .submit-btn"
            },
            "delete_cancel": {
                "by": By.CSS_SELECTOR,
                "select": ".modal-dialog .cancel-btn"
            },
            "delete_close": {
                "by": By.CSS_SELECTOR,
                "select": ".modal-dialog button.close"
            },
            "delete_loading": {
                "by": By.CSS_SELECTOR,
                "select": ".modal-dialog .msg-loading"
            },
            "waitspinner": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " div.shared-waitspinner"
            },
            "count": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] +" .shared-collectioncount"
            },
            "filter": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " input.search-query"
            },
            "filter_clear": {
                "by": By.CSS_SELECTOR,
                "select": container["select"] + " a.control-clear"
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
            }
        })
        self.wait_for_seconds = wait_for_seconds

    def get_count_title(self):
        """
        Get the count mentioned in the table title
        """
        return self.count.text.strip()

    def get_row_count(self):
        """
        Count the number of rows in the page.
        """
        return len(list(self._get_rows()))

    def get_headers(self):
        """
        Get list of headers from the table
        """
        return [each.text for each in self.get_elements("header")]

    def get_sort_order(self):
        """
        Get the column-header which is sorted rn.
        Warning: It depends on the class of the headers and due to it, the returned result might give wrong answer.
        :returns : a dictionary with the "header" & "ascending" order
        """
        for each_header in self.get_elements("header"):
            if re.search(r"\basc\b", each_header.get_attribute("class")):
                return {
                    "header": each_header.text.lower(),
                    "ascending": True
                }
            elif re.search(r"\bdesc\b", each_header.get_attribute("class")):
                return {
                    "header": each_header.text.lower(),
                    "ascending": False
                }

    def sort_column(self, column, ascending=True):
        """
        Sort a column in ascending or descending order
            :param column: The header of the column which should be sorted
            :param ascending: True if the column should be sorted in ascending order, False otherwise
        """
        for each_header in self.get_elements("header"):
            
            if each_header.text.lower() == column.lower():
                if "asc" in each_header.get_attribute("class") and ascending:
                    # If the column is already in ascending order, do nothing
                    return
                elif "asc" in each_header.get_attribute("class") and not ascending:
                    # If the column is in ascending order order and we want to have descending order, click on the column-header once
                    each_header.click()
                    self._wait_for_loadspinner()
                    return
                elif "desc" in each_header.get_attribute("class") and not ascending:
                    # If the column is already in descending order, do nothing
                    return
                elif "desc" in each_header.get_attribute("class") and ascending:
                    # If the column is in descending order order and we want to have ascending order, click on the column-header once
                    each_header.click()
                    self._wait_for_loadspinner()
                    return
                else:
                    # The column was not sorted before
                    if ascending:
                        # Click to sort ascending order
                        each_header.click()
                        self._wait_for_loadspinner()
                        return
                    else:
                        # Click 2 times to sort in descending order

                        #Ascending
                        each_header.click()
                        self._wait_for_loadspinner()
                        #Decending
                        # The existing element changes (class will be changed), hence, it can not be referenced again.
                        # So we need to get the headers again and do the same process.
                        self.sort_column(column, ascending=False)
                        return
        

    def _wait_for_loadspinner(self):
        """
        There exist a loadspinner when sorting/filter has been applied. This method will wait until the spinner is dissapeared 
        """
        try:
            self.wait_for("waitspinner")
            self.wait_until("waitspinner")
        except:
            print("Waitspinner did not appear")

    def get_table(self):
        """
        Get whole table in dictionary form. The row_name will will be the key and all header:values will be it's value.
        {row_1 : {header_1: value_1, . . .}, . . .}
        """
        time.sleep(7)

        table = dict()
        headers = self.get_headers()
        for each_row in self._get_rows():
            row_name = self._get_column_value(each_row, "name")
            table[row_name] = dict()
            for each_col in headers:
                each_col = each_col.lower()
                if each_col:
                        table[row_name][each_col] = self._get_column_value(each_row, each_col) 
        return table

    def get_cell_value(self, name, column):
        """
        Get a specific cell value.
            :param name: row_name of the table
            :param column: column header of the table
        """
        _row = self._get_row(name).strip()
        return self._get_column_value(_row, column)
    
    def get_column_values(self, column):
        """
        Get list of values of  column
            :param column: column header of the table
        """
        for each_row in self._get_rows():
            yield self._get_column_value(each_row, column)

    def get_list_of_actions(self, name):
        """
        Get list of possible actions for a specific row
        :param name: The name of the row
        """
        _row = self._get_row(name)
        _row.find_element(*self.elements["action_values"].values())
        return [each_element.text for each_element in self.get_elements("action_values")]

    def edit_row(self, name):
        """
        Edit the specified row. It will open the edit form(entity). The opened entity should be interacted with instance of entity-class only.
            :param name: row_name of the table
        """
        _row = self._get_row(name)
        _row.find_element(*self.elements["edit"].values()).click()
        time.sleep(self.wait_for_seconds)    

    def clone_row(self, name):
        """
        Clone the specified row. It will open the edit form(entity). The opened entity should be interacted with instance of entity-class only.
            :param name: row_name of the table
        """
        _row = self._get_row(name)
        _row.find_element(*self.elements["clone"].values()).click()
        time.sleep(self.wait_for_seconds)     

    def delete_row(self, name, cancel=False, close=False, prompt_msg=False):
        """
        Delete the specified row. Clicking on delete will open a pop-up. Delete the row if neither of (cancel, close) specified.
            :param name: row_name of the table
            :param cancel: if provided, after the popup is opened, click on cancel button and Do Not delete the row
            :param close:  if provided, after the popup is opened, click on close button and Do Not delete the row
        """

        # Click on action
        _row = self._get_row(name)
        _row.find_element(*self.elements["delete"].values()).click()        

        self.wait_for("delete_prompt")

        if cancel:
            self.delete_cancel.click()
            self.wait_until("delete_cancel")
            return True
        elif close:
            self.delete_close.click()
            self.wait_until("delete_close")
            return True  
        elif prompt_msg:
            return self.delete_prompt.text         
        else:
            self.delete_btn.click()
            self.wait_for("app_listings")
            
            
    def set_filter(self, filter_query):
        """
        Provide a string in table filter.
            :param filter_query: query of the filter
            :returns : resultant list of filtered row_names
        """
        self.filter.clear()
        self.filter.send_keys(filter_query)
        time.sleep(1)
        self._wait_for_loadspinner()
        return self.get_column_values("name")

    def clean_filter(self):
        """
        Clean the filter textbox
        """
        self.filter.clear()
        time.sleep(1)
        self._wait_for_loadspinner()

    def _get_column_value(self, row, column):
        """
        Get the column from a specific row provided.
        :param row: the webElement of the row
        :param column: the header name of the column
        """
        find_by_col_number = False
        if column.lower().replace(" ","_") in self.header_mapping:
            column = self.header_mapping[column.lower().replace(" ","_")]
            find_by_col_number = isinstance(column, int)

        if not find_by_col_number:
            col = self.elements["col"].copy()
            col["select"] = col["select"].format(column=column.lower().strip().replace(" ","_"))
            self.wait_for("app_listings")
            # print row.find_element(*col.values()).text
            return row.find_element(*col.values()).text
        else:
            col = self.elements["col-number"].copy()
            col["select"] = col["select"].format(col_number=column)
            self.wait_for("app_listings")
            return row.find_element(*col.values()).text
            

    def _get_rows(self):
        """
        Get list of rows
        """
        for each_row in self.get_elements("rows"):
            yield each_row

    def _get_row(self, name):
        """
        Get the specified row.
        :param name: row name 
        """
        for each_row in self._get_rows():
            # print self._get_column_value(each_row, "name").strip()
            if self._get_column_value(each_row, "name").strip() == name:
                return each_row
        else:
            raise ValueError("{} row not found in table".format(name)) 

    def get_action_values(self, name):
        _row = self._get_row(name)
        # _row.find_element(*self.elements["action"].values()).click()
        return [each.text for each in self.get_elements("action_values")]

    def get_count_number(self):
        # self.total_rows = self.count.text.strip()
        row_count = self.get_count_title()
        return int(re.search(r'\d+', row_count).group())

    def get_more_info(self, name, cancel=True):
        _row = self._get_row(name)
        _row.find_element(*self.elements["more_info"].values()).click()
        keys = self.more_info_row.find_elements(*self.elements["more_info_key"].values())
        values = self.more_info_row.find_elements(*self.elements["more_info_value"].values())        
        more_info = {key.text: value.text for key, value in zip(keys, values)}

        if cancel:
            _row = self._get_row(name)
            _row.find_element(*self.elements["more_info"].values()).click()

        return more_info

    def switch_to_page(self, value):
        for each in self.get_elements('switch_to_page'):
            if each.text.strip().lower() not in ['prev','next'] and int(each.text.strip()) == value:
                each.click()
                return True
        else:
            raise ValueError("{} not found".format(value))

    def switch_to_prev(self):
        for page_prev in self.get_elements('switch_to_page'):
            if page_prev.text.strip().lower() == "prev":
                page_prev.click()
                return True
        else:
            raise ValueError("{} not found".format(page_prev))

    def switch_to_next(self):
        for page_next in self.get_elements('switch_to_page'):
            if page_next.text.strip().lower() == "next":
                page_next.click()
                return True
        else:
            raise ValueError("{} not found".format(page_next))

        
