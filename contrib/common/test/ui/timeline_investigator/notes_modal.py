'''
The test framework for Notes Modal.
'''

from splunkwebdriver.models.components import By
from splunkwebdriver.models.html_objects import Input
from splunkwebdriver.models.html_objects import Table
from splunkwebdriver.models.components.shared.drop_down_menu import DropDownMenu

from ModalUtil import ModalUtil

import time

class NotesTimelineModal(ModalUtil):
    '''
    This class handles the Notes Modal.
    '''
    def __init__(self, browser, logger, by=By.CSS_SELECTOR,
                 value="div#add-note-entry-modal",
                 parent_instance=None, element=None):

        self.logger = logger

        super(NotesTimelineModal, self).__init__(
            browser=browser, logger=logger, by=by, value=value,
            parent_instance=parent_instance, element=element)
        
        self.notes_table = Table.Table(self.browser, by=By.CSS_SELECTOR,
                                        value='table#notes-entries-table', parent_instance=self)
        self.search_filter = Input.Text(self.browser, by=By.CSS_SELECTOR,
                                        value = 'input#notes-free-text-filter', parent_instance=self)
    
    def saved_notes_exist(self):
        '''
        Return True if Saved Notes exist or False.
        '''
        try:
            no_notes_element = self.browser.find_element_by_css_selector("div#add-note-entry-modal div.selected-message-container+div.alert-info")
            if no_notes_element.text == "No notes exist yet":
                return False
            else:
                return True
        except:
            return True
    
    def click_create_a_new_note(self):
        '''
        Click New Note Button.
        '''
        self.click_anchor(by=By.CSS_SELECTOR, css_elem="a#make-note-operation")
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div#add-note-entry-modal")
        
    def click_all_notes(self):
        '''
        Click New Note Button.
        '''
        self.click_anchor(by=By.CSS_SELECTOR, css_elem="a#navigate-to-all-notes")
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#add-note-entry-modal")
    
    def click_add_to_investigation(self):
        '''
        Click  Add to Investigation button.
        '''
        if self.saved_notes_exist() == True:
            self.click_anchor(by=By.CSS_SELECTOR, css_elem="a#save-note-to-timeline-operation")
            self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div#add-note-entry-modal")

    def get_saved_notes_list(self):
        '''
        Get the list of Timelines in the table.
        '''
        self.logger.info("Getting the list of timelines available.")
        
        try:
            return [row.get_table_data_for_column(2).text for row in self.notes_table.get_table_rows() if row.get_table_data_for_column(2) is not None]
        except:
            return list()
    
    def get_saved_notes_count(self):
        '''
        Get the count of Saved Notes.
        '''
        return len(self.get_saved_notes_list())
        
    def search_notes_using_filter(self, name=None):
        '''
        Search the Notes using Filter.
        '''
        self.search_filter.value = name
        
        if (len(self.get_saved_notes_list()) > 0) and (name in self.get_saved_notes_list()):
            return True

        return False
    
    def select_saved_note(self, title):
        '''
        Select the Saved Notes
        '''
        assert title is not None
        
        all_rows  = self.notes_table.get_table_rows()
        
        all_matching_links = [row.find_element_by_css_selector("input[type='checkbox']") for row in all_rows if row.get_table_data_for_column(2) is not None 
                    and row.get_table_data_for_column(2).text == title]

        assert len(all_matching_links) > 0
        
        #If more than one match is present, click the last one as its the most recent one.
        all_matching_links[len(all_matching_links)-1].click()
        time.sleep(3)

class NotesEditModal(ModalUtil):
    '''
    This class handles the Notes Edit Modal.
    There are 2 modals with same ID's attached to DOM,
    so finding the sibling of div#timeline-action-history-dialog 
    that matches the Modal we need.
    '''
    def __init__(self, browser, logger, by=By.CSS_SELECTOR,
                 value="div#timeline-action-history-dialog + div#edit-timeline-entry-modal",
                 parent_instance=None, element=None):

        self.logger = logger

        super(NotesEditModal, self).__init__(
            browser=browser, logger=logger, by=by, value=value,
            parent_instance=parent_instance, element=element)
    
    def fill_edit_entry_modal(self, title=None, time=None, description=None):
        '''
        Fill in the contents of Edit Entry Modal.
        '''
        
        if title is not None:
            try:
                self.input_text(css_elem="input#note-title-input", value=title)
            except Exception:
                self.input_text(css_elem="span#title-input input[type='text']", value=title)
        
        if time is not None:
            self.input_text(css_elem="input#start-time-input", value=time)
        
        if description is not None:
            self.input_textarea(css_elem="textarea#description-input", value=description)
            
    def click_all_notes(self):
        '''
        Click New Note Button.
        '''
        self.click_anchor(by=By.CSS_SELECTOR, css_elem="a#navigate-to-all-notes")
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#add-note-entry-modal")
        
    def click_attach_button(self):
        '''
        Click attach file button
        '''
        self.click_anchor(by=By.CSS_SELECTOR, css_elem="button#attachment-button")
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#upload-file-modal")
        
    def click_delete_attachment(self):
        '''
        Click delete attach file
        '''
        self.click_achor(by=By.CSS_SELECTOR, css_elem="a.delete-file")
        
    def click_note_content(self):
        '''
        Click select file button
        '''
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="a#back-to-note")
        lbl = self.browser.find_element_by_css_selector("a#back-to-note")
        lbl.click()
        self.browser.wait_for_element_visible(by=By.CSS_SELECTOR, value="div#timeline-action-history-dialog + div#edit-timeline-entry-modal")
    
    def click_save_and_back(self):
        '''
        Click Save and Back.
        '''
        try:
            self.click_anchor(by=By.CSS_SELECTOR, css_elem="a.save-timeline-entry-unassociated-operation")
        except Exception:
            self.click_anchor(by=By.CSS_SELECTOR, css_elem="a#save-timeline-entry-unassociated-operation")
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div#timeline-action-history-dialog + div#edit-timeline-entry-modal")
    
    def click_add_to_investigation(self):
        '''
        Click Add to Investigation.
        '''
        try:
            self.click_anchor(by=By.CSS_SELECTOR, css_elem="a.save-timeline-entry-operation")
        except Exception:
            self.click_anchor(by=By.CSS_SELECTOR, css_elem="a#save-timeline-entry-operation")
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div#timeline-action-history-dialog + div#edit-timeline-entry-modal")
    
    def click_save(self):
        '''
        Click Save Button when Editing an Entry.
        '''
        try:
            self.click_anchor(by=By.CSS_SELECTOR, css_elem="a.save-timeline-entry-edit-operation")
        except Exception:
            self.click_anchor(by=By.CSS_SELECTOR, css_elem="a#save-timeline-entry-edit-operation")
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div#timeline-action-history-dialog + div#edit-timeline-entry-modal")

class ActionHistoryModal(ModalUtil):
    '''
    This handles the Modal to add 
    Action History Items to Timeline.
    '''
    def __init__(self, browser, logger, by=By.CSS_SELECTOR,
                 value="div#timeline-action-history-dialog div#add-timeline-action-entry-modal",
                 parent_instance=None, element=None):

        self.logger = logger

        super(ActionHistoryModal, self).__init__(
            browser=browser, logger=logger, by=by, value=value,
            parent_instance=parent_instance, element=element)

        self.action_history_table = Table.Table(self.browser, by=By.CSS_SELECTOR,
                                        value='table#action-entries-table', parent_instance=self)
        self.search_filter = Input.Text(self.browser, by=By.CSS_SELECTOR,
                                        value = 'input#action-history-free-text-filter', parent_instance=self)
    
    def select_type_value(self, select_value):
        '''
        Select Type From DropDown Secondary Control.
        '''
        type_selector = DropDownMenu(self.browser,toggle_by=By.CSS_SELECTOR, toggle_value=".action-history-controls .dropdown-toggle",
                                          dialog_value=".action-history-controls .dropdown-menu")
        type_selector.select(select_value)
    
    def get_action_history_table_row_details_by_index(self, index=1):
        '''
        Get the list of Timelines in the table.
        '''
                
        table_data = self.action_history_table.get_table_data_matrix()
        
        return [{'Time':item[1].text, 'Action':item[2].text, 'Type':item[3].text} for item in table_data][index] if (len(table_data) > 0) else None
        

    def get_all_action_history_table_row_details(self):
        '''
        Get the list of Timelines in the table.
        '''
                
        table_data = self.action_history_table.get_table_data_matrix()
        
        return [{'Time':item[1].text, 'Action':item[2].text, 'Type':item[3].text} for item in table_data][1:] if (len(table_data) > 0) else None
    
    def find_row_by_action_and_type(self, action, type):
        '''
        Find a Row by Action and Type.
        '''
        all_rows = self.get_all_action_history_table_row_details()
        matching_rows = [row for row in all_rows if row['Action'] == action and row['Type'] == type]

        return True if len(matching_rows)>0 else False

    def search_action_history(self, value):
        '''
        Search For Value.
        '''
        self.search_filter.value = value
    
    def select_action_history_row_by_action(self, action):
        '''
        Click the checkbox by matching Action
        '''
        all_rows  = self.action_history_table.get_table_rows()
        
        all_matching_links = [row.find_element_by_css_selector("input[type='checkbox']") for row in all_rows[1:] if row.get_table_data_for_column(2).text == action]

        assert len(all_matching_links) > 0
        
        all_matching_links[0].click()
        time.sleep(3)
    
    def click_save(self):
        '''
        Click Save Button.
        '''
        self.click_anchor(by=By.CSS_SELECTOR, css_elem="a#save-timeline-action-history-entry-operation")
        self.browser.wait_for_element_not_visible(by=By.CSS_SELECTOR, value="div#timeline-action-history-dialog div#add-timeline-action-entry-modal")