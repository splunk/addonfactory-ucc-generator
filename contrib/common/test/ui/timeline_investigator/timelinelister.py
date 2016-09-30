'''
The test framework class that provides methods for automating Timeline feature.
'''

from splunkwebdriver.models.components import By
from splunkwebdriver.models.html_objects import Input
from splunkwebdriver.models.html_objects import Table
from splunkwebdriver.models.components import BaseComponent
from splunkwebdriver.models.components.shared.drop_down_menu import DropDownMenu

from ModalUtil import ModalUtil

import time
import pytest

class TimelineLister(BaseComponent):
    
    def __init__(self, browser, logger, by=By.ID,
                 value='timelines_list', parent_instance=None, element=None, edit_access=True):
        
        self.logger     = logger
        self.browser    = browser
        self.objects = {}

        super(TimelineLister, self).__init__(browser=browser, by=by, value=value,
                                          objects=self.objects, parent_instance=parent_instance)

        self.edit_access = edit_access

        self.wait_for_timeline_lister_page_load()
        
        if self.edit_access:
            self.create_new_investigation = self.browser.find_element_by_css_selector("a.add-timeline")
        
        self.search_filter = Input.Text(self.browser, by=By.CSS_SELECTOR,
                                        value = 'input#free-text-filter', parent_instance=self)
        
        self.timelines_list_table = Table.Table(self.browser, by=By.CSS_SELECTOR,
                                        value='table#table', parent_instance=self)
        
        self.time_selector = DropDownMenu(self.browser,toggle_by=By.CSS_SELECTOR, toggle_value=".time-filter .dropdown-toggle",
                                          dialog_value=".time-filter .dropdown-menu")

        self.edit_selection = DropDownMenu(self.browser,toggle_by=By.CSS_SELECTOR, toggle_value=".actions-section .dropdown-toggle",
                                          dialog_value=".actions-section .dropdown-menu")
            
    def wait_for_timeline_lister_page_load(self):
        '''
        Wait for the Timeline Lister page to load.
        '''
        self.logger.info("Waiting for Timeline Lister page to Load....")
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="table#table")
        
        if self.edit_access:
            self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="a.add-timeline")
    
    def click_create_new_investigation(self):
        '''
        Click on the Create New Investigation Button
        '''
        self.logger.info("Clicking the Create New Investigation button.")
        self.create_new_investigation.click()

    def search_timeline(self, name):
        '''
        Search of Timeline using the filter.
        '''
        self.logger.info("Searching for the timeline %s", name)
        self.search_filter.value = name
        
        if len(self.get_timelines_list()) > 0:
            self.logger.info("Timeline found in the table")
            return True

        return False
    
    def delete_selected_timelines(self):
        '''
        Click the Edit Selection drop-down and 
        click delete to delete selected timelines.
        '''
        self.edit_selection.select("Delete")
        delete_modal = DeleteTimelineModal(self.browser, self.logger)
        delete_modal.click_delete_button()

    def get_timelines_list(self):
        '''
        Get the list of Timelines in the table.
        '''
        self.logger.info("Getting the list of timelines available.")
        
        try:
            return [row.get_table_data_for_column(1).text for row in self.timelines_list_table.get_table_rows() if row.get_table_data_for_column(1) is not None]
        except:
            return list()
    
    def get_timelines_count(self):
        '''
        Get the count of the timelines.
        '''
        return len(self.get_timelines_list())
    
    def click_timeline(self, name=None):
        '''
        Click  a timeline on the Timelist page with the name provided.
        '''
        assert name is not None
        
        self.logger.info("Trying to click %s Timeline", name)
        all_rows  = self.timelines_list_table.get_table_rows()
        
        all_links = [row.find_element_by_tag_name('a') for row in all_rows if row.get_table_data_for_column(1) is not None 
                    and row.find_element_by_tag_name('a').text == name]

        self.logger.info("The elements matching the Timelines are %s", all_links)
        assert len(all_links) > 0
        
        browser_type = pytest.config.getvalue('browser')
        
        #If more than one match is present, click the last one as its the most recent one.
        #For Firefox, one click works but for Chrome two are needed. Since these are run on
        #Chrome, leaving this with 2 clicks.
        if browser_type == 'chrome':
            all_links[len(all_links)-1].click()
            all_links[len(all_links)-1].click()
        else:
            all_links[len(all_links)-1].click()

        
    def get_timeline_details(self, name=None):
        '''
        Get a dictionary of all the details of 
        timeline with matching name.
        '''
        assert name is not None
        
        all_rows  = self.timelines_list_table.get_table_rows()
        
        all_details = {}
        matching_row = [row for row in all_rows if row.get_table_data_for_column(1) is not None 
                    and row.find_element_by_tag_name('a').text == name]
        
        assert len(matching_row) > 0
        
        matching_row = matching_row[0]
        
        Last_Modified_Time = matching_row.get_table_data_for_column(2).text
        Creation_Time = matching_row.get_table_data_for_column(3).text
        edit_remove_links = matching_row.get_table_data_for_column(4).find_elements_by_tag_name('a')
        assert len(edit_remove_links) == 2
        
        edit_link = edit_remove_links[0]
        remove_link = edit_remove_links[1]
        
        all_details['Last Modified Time'] = Last_Modified_Time
        all_details['Creation Time'] = Creation_Time
        all_details['Edit Link'] = edit_link
        all_details['Remove Link'] = remove_link

        return all_details
    
    def click_edit_timeline(self, name=None):
        '''
        Click Edit Timeline matching name.
        '''
        timeline = self.get_timeline_details(name)
        timeline['Edit Link'].click()
    
    def remove_timeline(self, name=None):
        '''
        Remove a timeline that matches
        name.
        '''
        count = self.get_timelines_count()
        timeline = self.get_timeline_details(name)
        timeline['Remove Link'].click()
        time.sleep(3)
        delete_modal = DeleteTimelineModal(self.browser, self.logger)
        delete_modal.click_delete_button()
        
        new_count = self.get_timelines_count()
        assert count-1 == new_count
    
    def get_investigation_count_text(self):
        '''
        Get Investigations text count.
        '''
        investigations_text = self.browser.find_element_by_css_selector("#investigation_count").text
        return investigations_text.strip("Investigations")

    def select_timeline(self, name=None):
        '''
        Click the checkobox of a Timeline row.
        '''
        assert name is not None

        all_rows  = self.timelines_list_table.get_table_rows()
        
        all_details = {}
        matching_row = [row for row in all_rows if row.get_table_data_for_column(1) is not None 
                    and row.find_element_by_tag_name('a').text == name]
        
        assert len(matching_row) > 0
        
        matching_row_checkbox = matching_row[0].find_element_by_css_selector("input.timeline_checkbox")
        matching_row_checkbox.click()

class DeleteTimelineModal(ModalUtil):
    '''
    This class handles the DeleteTimeline Modal.
    '''
    def __init__(self, browser, logger, by=By.CSS_SELECTOR,
                 value="div#delete-timeline-modal",
                 parent_instance=None, element=None):

        self.logger = logger

        super(DeleteTimelineModal, self).__init__(
            browser=browser, logger=logger, by=by, value=value,
            parent_instance=parent_instance, element=element)
        
    def click_delete_button(self):
        '''
        Click the delete button.
        '''
        self.click_anchor(by=By.CSS_SELECTOR, css_elem='a#delete-timeline-operation')
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div#delete-timeline-modal")